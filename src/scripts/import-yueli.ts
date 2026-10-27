import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  getPayload,
  type DataFromCollectionSlug,
  type RequiredDataFromCollectionSlug,
} from 'payload'
import { convertHTMLToLexical, type LexicalRichTextAdapter } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import config from '@payload-config'
import source from '../data/yueli.json'
import type { Category, Media } from '@/payload-types'

// Only the dedicated local database may be seeded automatically. Never wipe a database.
const database = new URL(process.env.DATABASE_URL || '')
if (
  !['localhost', '127.0.0.1'].includes(database.hostname) ||
  database.pathname !== '/yueliautomation'
) {
  throw new Error(
    'Import requires the dedicated local yueliautomation database. No data was changed.',
  )
}
const refresh = process.argv.includes('--refresh')
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const mediaCache = new Map<string, Media>()
const categories = new Map<number, Category>()
const editorConfig = (payload.config.editor as LexicalRichTextAdapter).editorConfig
const richText = (html: string) =>
  convertHTMLToLexical({ editorConfig, html: html || '<p></p>', JSDOM })
const migration = (item: { id: number; path: string; html: string; summary?: string }) => ({
  sourceId: item.id,
  sourcePath: item.path,
  sourceURL: source.sourceOrigin + item.path,
  contentHTML: item.html,
  summary: item.summary || '',
})
async function media(src: string, alt: string): Promise<Media | undefined> {
  if (!src) return undefined
  if (mediaCache.has(src)) return mediaCache.get(src)
  if (!src.startsWith('/yueli-assets/')) throw new Error(`Expected a local migrated image: ${src}`)
  const filename = path.basename(src)
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
    depth: 0,
  })
  const result =
    existing.docs[0] ||
    (await payload.create({
      collection: 'media',
      data: { alt },
      filePath: path.join(process.cwd(), 'public', src),
      overrideAccess: true,
      context,
    }))
  mediaCache.set(src, result)
  return result
}
async function upsert<C extends 'categories' | 'products' | 'posts' | 'pages'>(
  collection: C,
  sourceId: number,
  data: RequiredDataFromCollectionSlug<C>,
): Promise<DataFromCollectionSlug<C>> {
  const existing = await payload.find({
    collection,
    where: { 'migration.sourceId': { equals: sourceId } },
    limit: 1,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    if (!refresh) return existing.docs[0]
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data: data as Parameters<typeof payload.update<C, never>>[0]['data'],
      locale: 'en',
      overrideAccess: true,
      context,
    })
  }
  return payload.create({ collection, data, locale: 'en', overrideAccess: true, context })
}
try {
  for (const item of source.categories) {
    const result = await upsert('categories', item.id, {
      title: item.title,
      slug: item.slug,
      migration: migration(item),
    })
    categories.set(item.id, result)
  }
  for (const item of source.categories) {
    if (item.parent && categories.has(item.parent))
      await payload.update({
        collection: 'categories',
        id: categories.get(item.id)!.id,
        data: { parent: categories.get(item.parent)!.id },
        overrideAccess: true,
        context,
      })
  }
  console.log(`Imported ${categories.size} categories with original hierarchy`)
  const featured = new Set([1708, 1710, 1712, 1716, 2290, 2450, 2436, 1724])
  for (const item of source.products) {
    const gallery = await Promise.all(
      item.images.map(async (image) => ({
        image: (await media(image.src, image.alt))!.id,
        caption: image.alt,
      })),
    )
    await upsert('products', item.id, {
      title: item.title,
      slug: item.slug,
      _status: 'published',
      publishedAt: item.publishedAt,
      general: {
        heroImage: gallery[0]?.image,
        gallery,
        shortDescription: item.summary,
        description: richText(item.html),
      },
      pricing: { unit: 'piece', sku: item.sku },
      organization: {
        category: categories.get(item.categories[0])?.id,
        featured: featured.has(item.id),
      },
      migration: {
        ...migration(item),
        attributes: item.attributes,
        categories: item.categories.map((id) => categories.get(id)!.id),
      },
      meta: { title: item.title, description: item.summary.slice(0, 300) },
    })
    console.log(`Product: ${item.title}`)
  }
  for (const item of source.posts) {
    await upsert('posts', item.id, {
      title: item.title,
      slug: item.slug,
      _status: 'published',
      publishedAt: item.publishedAt,
      heroImage: (await media(item.image, item.title))?.id,
      content: richText(
        item.html ||
          `<p>${item.summary.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
      ),
      migration: migration(item),
      meta: { title: item.title, description: item.summary.slice(0, 300) },
    })
  }
  for (const item of source.pages) {
    await upsert('pages', item.id, {
      title: item.title,
      slug: item.slug,
      _status: 'published',
      publishedAt: item.publishedAt,
      hero: { type: 'none' },
      layout: [
        { blockType: 'content', columns: [{ size: 'full', richText: richText(item.html) }] },
      ],
      migration: migration(item),
      discovery: { noIndex: item.noIndex },
    })
  }
  const formTitle = 'Yueli equipment and project inquiry'
  const oldForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: formTitle } },
    limit: 1,
    overrideAccess: true,
  })
  const form =
    oldForm.docs[0] ||
    (await payload.create({
      collection: 'forms',
      overrideAccess: true,
      context,
      data: {
        title: formTitle,
        submitButtonLabel: 'Submit',
        confirmationType: 'message',
        confirmationMessage: richText('<p>Great! We’ve received your information.</p>'),
        emails: [],
        fields: [
          {
            blockType: 'text',
            name: 'e-form-first-name',
            label: 'Name',
            required: true,
            width: 50,
          },
          {
            blockType: 'text',
            name: 'e-form-last-name',
            label: 'Company',
            required: true,
            width: 50,
          },
          { blockType: 'email', name: 'e-form-email', label: 'Email', required: true, width: 100 },
          {
            blockType: 'textarea',
            name: 'e-form-message',
            label: 'Project Requirement',
            required: true,
            width: 100,
          },
          {
            blockType: 'checkbox',
            name: 'checkbox_e-form-checkbox',
            label: 'I confirm this is a business inquiry',
            required: false,
            width: 100,
          },
        ],
      },
    }))
  const brand = source.brand
  const slides = await Promise.all(
    brand.slides.map(async (slide) => ({
      ...slide,
      image: (await media(slide.image, slide.title))!.id,
    })),
  )
  const factoryImages = await Promise.all(
    brand.factoryImages.map(async (image) => ({
      image: (await media(image.src, image.alt))!.id,
      caption: image.alt,
    })),
  )
  const certificates = await Promise.all(
    brand.certificates.map(async (image) => ({
      image: (await media(image.src, image.alt))!.id,
      caption: image.alt,
    })),
  )
  const existingBrand = await payload.findGlobal({
    slug: 'equipment-site',
    locale: 'en',
    depth: 0,
    overrideAccess: true,
  })
  if (!existingBrand.logo || refresh)
    await payload.updateGlobal({
      slug: 'equipment-site',
      locale: 'en',
      overrideAccess: true,
      context,
      data: {
        name: brand.name,
        logo: (await media(brand.logo, brand.name))!.id,
        email: brand.email,
        telephone: brand.telephone,
        address: brand.address,
        introduction:
          'Yueli Automation supplies standard equipment and custom production solutions for manufacturers. We begin with your workpiece, process requirements and target output, then help identify an appropriate equipment route.',
        navigation: [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products/' },
          { label: 'About Us', href: '/about-us/' },
          { label: 'Blog', href: '/blog/' },
          { label: 'FAQ', href: '/faq/' },
          { label: 'Contact', href: '/contact-us/' },
        ],
        slides,
        factoryImages,
        certificates,
        inquiryForm: form.id,
      },
    })
  if (!existingBrand.logo || refresh)
    await payload.updateGlobal({
      slug: 'search-settings',
      locale: 'en',
      overrideAccess: true,
      context,
      data: {
        siteName: brand.name,
        siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
        description:
          'Industrial drilling, tapping, milling, CNC machining, casting, polishing, assembly and testing equipment from Yueli Automation in Quanzhou, China.',
        organization: {
          legalName: 'Quanzhou Yueli Automation Equipment Co., Ltd.',
          email: brand.email,
          telephone: brand.telephone,
        },
        geo: {
          enabled: true,
          summary:
            'Yueli Automation develops industrial machining and automation equipment in Nan’an, Quanzhou, Fujian, China. Equipment selection begins with the workpiece, process and production requirements.',
        },
      },
    })
  await fs.mkdir('.migration', { recursive: true })
  await fs.writeFile(
    '.migration/import-report.json',
    JSON.stringify(
      {
        importedAt: new Date().toISOString(),
        database: 'yueliautomation',
        products: source.products.length,
        posts: source.posts.length,
        pages: source.pages.length,
        categories: source.categories.length,
        media: mediaCache.size,
        form: form.id,
        mode: refresh ? 'refresh' : 'additive',
      },
      null,
      2,
    ),
  )
  console.log(
    'Yueli import completed. Existing records are preserved on subsequent runs; use --refresh only when intentionally replacing imported content.',
  )
} finally {
  await payload.destroy()
}
