import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  createLocalReq,
  getPayload,
  initTransaction,
  commitTransaction,
  killTransaction,
  type CollectionSlug,
} from 'payload'
import config from '@payload-config'
import en from '../../messages/en.json'
import zh from '../../messages/zh.json'
import { getPath, setPath, projectTranslation, translationSlug } from '@/i18n/contentSchema'
import { messageLeaves, validateMessages } from '@/i18n/messageValidation'

const apply = process.argv.includes('--apply')
const option = (name: string) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
if (process.env.ENABLE_DYNAMIC_CONTENT !== 'true')
  throw new Error('Enable the dynamic model for this one-shot process.')
if (apply && (!option('backup') || !(await fs.stat(option('backup')!)).size))
  throw new Error('A restore-verified backup is required before publication.')
const previousMessages = option('previous-messages')
  ? JSON.parse((await fs.readFile(option('previous-messages')!, 'utf8')).replace(/^\uFEFF/, ''))
  : null
if (!previousMessages)
  throw new Error(
    'Provide --previous-messages=path to the former English template so custom copy is retained.',
  )
const payload = await getPayload({ config })
const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)
const report: Array<{ collection: string; subject: string | number; action: string }> = []
try {
  const site = await payload.findGlobal({ slug: 'equipment-site', depth: 0 })
  if (!site.name.includes('Yueli'))
    throw new Error('This publication script is only for the Yueli site.')
  const languages = (await payload.find({ collection: 'languages', pagination: false, depth: 0 }))
    .docs
  const english = languages.find((item) => item.code === 'en')
  if (!english) throw new Error('Migrate language content first.')
  if (apply) {
    await initTransaction(req)
    if (!(await req.transactionID)) throw new Error('Publication requires a database transaction.')
  }

  async function publish(
    collection: CollectionSlug,
    subject: string | number,
    data: Record<string, unknown>,
    language = english!.id,
  ) {
    const existing = (
      await payload.find({
        collection,
        req,
        depth: 0,
        draft: true,
        limit: 1,
        where: {
          and: [
            { language: { equals: language } },
            ...(collection === 'site-copy' ? [] : [{ subject: { equals: subject } }]),
          ],
        },
      })
    ).docs[0] as unknown as Record<string, unknown> | undefined
    // Initial migration drafts were audited against the source. Never promote a
    // later editorial draft over an already published translation on a rerun.
    if (existing?._status === 'draft') {
      const published = await payload.findVersions({
        collection,
        req,
        depth: 0,
        limit: 1,
        where: {
          and: [
            { parent: { equals: existing.id } },
            { 'version._status': { equals: 'published' } },
          ],
        },
      })
      if (published.totalDocs)
        throw new Error(
          `Unpublished editorial changes require review: ${collection}/${existing.id}`,
        )
    }
    const unchanged =
      existing?._status === 'published' &&
      Object.entries(data).every(
        ([key, value]) => JSON.stringify(existing[key]) === JSON.stringify(value),
      )
    report.push({
      collection,
      subject,
      action: unchanged ? 'keep-existing' : apply ? 'publish' : 'would-publish',
    })
    if (!apply || unchanged) return
    const values = {
      ...data,
      ...(collection === 'site-copy' ? {} : { subject }),
      language,
      _status: 'published' as const,
    }
    if (existing)
      await payload.update({
        collection,
        id: existing.id as number,
        data: values as never,
        req,
        depth: 0,
      })
    else await payload.create({ collection, data: values as never, req, depth: 0 })
  }

  for (const source of ['categories', 'media', 'industry-templates', 'forms'] as const) {
    const collection = translationSlug(source) as CollectionSlug
    const paths = payload.collections[collection].config.custom?.translationPaths as string[]
    const documents = (
      await payload.find({
        collection: source,
        req,
        locale: 'en',
        fallbackLocale: false,
        depth: 0,
        pagination: false,
      })
    ).docs
    for (const document of documents) {
      const existing = (
        await payload.find({
          collection,
          req,
          depth: 0,
          draft: true,
          limit: 1,
          where: {
            and: [{ subject: { equals: document.id } }, { language: { equals: english.id } }],
          },
        })
      ).docs[0]
      const data = projectTranslation((existing || {}) as unknown as Record<string, unknown>, paths)
      for (const key of paths) {
        const value = getPath(data, key)
        if (value !== null && value !== '' && !(Array.isArray(value) && !value.length)) continue
        let translated = getPath(document, key)
        if (source === 'categories' && key === 'title' && translated === '未分类')
          translated = 'Uncategorized'
        // The reviewed legacy English site supplies these captions and labels.
        // Leave unknown Chinese media captions empty rather than inventing a translation.
        if (source === 'media' && /[\u4e00-\u9fff]/.test(JSON.stringify(translated || ''))) continue
        if (translated !== undefined) setPath(data, key, translated)
      }
      await publish(collection, document.id, data)
    }
  }
  const links = [
    ['Home', '/'],
    ['Products', '/products/'],
    ['About Us', '/about-us/'],
    ['Blog', '/blog/'],
    ['FAQ', '/faq/'],
    ['Contact', '/contact-us/'],
  ]
  for (const source of ['header', 'footer'] as const) {
    const collection = translationSlug(source) as CollectionSlug
    const current = (
      await payload.find({
        collection,
        req,
        depth: 0,
        draft: true,
        limit: 1,
        where: { language: { equals: english.id } },
      })
    ).docs[0] as { navItems?: unknown[] } | undefined
    const navItems = current?.navItems?.length
      ? current.navItems
      : links.map(([label, url]) => ({
          link: {
            type: 'custom',
            url,
            label:
              source === 'footer'
                ? label === 'FAQ'
                  ? 'Faq'
                  : label === 'Contact'
                    ? 'Contact Us'
                    : label
                : label,
          },
        }))
    await publish(collection, source, { navItems })
  }
  const source = 'search-settings'
  const collection = translationSlug(source) as CollectionSlug
  const seo = await payload.findGlobal({
    slug: source,
    req,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
  })
  const paths = payload.collections[collection].config.custom?.translationPaths as string[]
  const existing = (
    await payload.find({
      collection,
      req,
      depth: 0,
      draft: true,
      limit: 1,
      where: { language: { equals: english.id } },
    })
  ).docs[0]
  const seoData = projectTranslation((existing || {}) as unknown as Record<string, unknown>, paths)
  for (const key of paths)
    if (getPath(seoData, key) == null || getPath(seoData, key) === '')
      setPath(seoData, key, getPath(seo, key) ?? null)
  await publish(collection, source, seoData)

  for (const language of languages.filter((item) => item.code === 'en' || item.code === 'zh')) {
    const current = (
      await payload.find({
        collection: 'site-copy',
        req,
        depth: 0,
        draft: true,
        limit: 1,
        where: { language: { equals: language.id } },
      })
    ).docs[0]
    const messages = structuredClone(
      current?.messages || (language.code === 'en' ? en : zh),
    ) as Record<string, unknown>
    const target = language.code === 'en' ? en : zh
    for (const [key, value] of Object.entries(messageLeaves(target))) {
      const old = getPath(messages, key)
      if (!old || (language.code === 'en' && old === getPath(previousMessages, key)))
        setPath(messages, key, value)
    }
    const validity = validateMessages(messages)
    if (validity !== true) throw new Error(validity)
    await publish('site-copy', language.code, { messages }, language.id)
  }
  report.push({
    collection: 'languages',
    subject: 'en',
    action: english.enabled ? 'keep-enabled' : apply ? 'enable' : 'would-enable',
  })
  // Normal publication/enable hooks run: no languageMigration validation bypass.
  if (apply && !english.enabled)
    await payload.update({ collection: 'languages', id: english.id, data: { enabled: true }, req })
  if (apply) await commitTransaction(req)
  const output = path.resolve(
    `.backups/yueli-english-${apply ? 'applied' : 'planned'}-${Date.now()}.json`,
  )
  await fs.writeFile(
    output,
    JSON.stringify({ apply, generatedAt: new Date().toISOString(), report }, null, 2),
  )
  console.log(
    JSON.stringify({
      checks: report.length,
      output,
      actions: report.reduce<Record<string, number>>((counts, item) => {
        counts[item.action] = (counts[item.action] || 0) + 1
        return counts
      }, {}),
    }),
  )
} catch (error) {
  if (apply) await killTransaction(req)
  throw error
} finally {
  await payload.destroy()
}
process.exit(0)
