import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { buyingContent, categoryGuidance, primaryNavigation } from '../data/yueli-architecture'

const database = new URL(process.env.DATABASE_URL || '')
if (
  !['localhost', '127.0.0.1'].includes(database.hostname) ||
  database.pathname !== '/yueliautomation'
) {
  throw new Error('This seed is restricted to the dedicated local yueliautomation database.')
}
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const products = (
    await payload.find({
      collection: 'products',
      locale: 'en',
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
  ).docs
  const categories = (
    await payload.find({
      collection: 'categories',
      where: { taxonomy: { equals: 'product' } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
  ).docs
  const ids = new Map<string, number>()
  const created = new Set<string>()
  for (const item of buyingContent) {
    const old = await payload.find({
      collection: 'equipment-content',
      where: { slug: { equals: item.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (old.docs[0]) {
      ids.set(item.slug, old.docs[0].id)
      continue
    }
    const relatedProducts = item.productSlugs.map((slug) => {
      const product = products.find((p) => p.slug === slug)
      if (!product) throw new Error(`Referenced product does not exist: ${slug}`)
      return product.id
    })
    const relatedCategories = item.categorySlugs.map((slug) => {
      const category = categories.find((c) => c.slug === slug)
      if (!category) throw new Error(`Referenced category does not exist: ${slug}`)
      return category.id
    })
    const result = await payload.create({
      collection: 'equipment-content',
      locale: 'en',
      overrideAccess: true,
      context,
      data: {
        kind: item.kind,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        _status: 'published',
        sections: item.sections.map((section) => ({ ...section })),
        questions: item.questions.map((question) => ({ ...question })),
        relatedProducts,
        relatedCategories,
        editorialNotes:
          'Buyer planning guidance based on the existing Yueli catalog and published contact terms. No customer results, certified capacity or guaranteed performance are asserted. Confirm project-specific terms with the buyer.',
      },
    })
    ids.set(item.slug, result.id)
    created.add(item.slug)
  }
  for (const item of buyingContent) {
    if (!created.has(item.slug)) continue
    await payload.update({
      collection: 'equipment-content',
      id: ids.get(item.slug)!,
      locale: 'en',
      overrideAccess: true,
      context,
      data: { relatedContent: item.relatedSlugs.map((slug) => ids.get(slug)!) },
    })
  }
  for (const item of categoryGuidance) {
    const category = categories.find((c) => c.slug === item.slug)
    if (!category || category.buyerGuide?.summary) continue
    await payload.update({
      collection: 'categories',
      id: category.id,
      locale: 'en',
      overrideAccess: true,
      context,
      data: {
        buyerGuide: {
          summary: item.summary,
          selectionNotes: item.selectionNotes,
          resources: item.resources.map((slug) => ids.get(slug)!),
        },
      },
    })
  }
  const site = await payload.findGlobal({
    slug: 'equipment-site',
    locale: 'en',
    depth: 0,
    overrideAccess: true,
  })
  // Upgrade the initial migration menu once. Preserve subsequent manual navigation edits.
  if (!site.navigation?.some((item) => item.href === '/solutions')) {
    await payload.updateGlobal({
      slug: 'equipment-site',
      locale: 'en',
      overrideAccess: true,
      context,
      data: { navigation: primaryNavigation },
    })
  }
  console.log(
    `Architecture ready: ${ids.size} solutions/guides (${created.size} newly created), ${categoryGuidance.length} category guidance targets.`,
  )
} finally {
  await payload.destroy()
}
