// @vitest-environment node
import 'dotenv/config'
import { it, expect, vi } from 'vitest'
vi.hoisted(() => {
  process.env.ENABLE_DYNAMIC_CONTENT = 'true'
})
import { PGlite } from '@electric-sql/pglite'
import { BasePayload, createLocalReq } from 'payload'

import config from '@payload-config'
import enMessages from '../../messages/en.json'
import { createContentReader } from '@/i18n/content'
import { migrateLanguageContent } from '@/i18n/migrateContent'

it('runs Japanese draft/publish/withdraw and shared inventory through the real Payload adapter', async () => {
  const database = new PGlite()
  const payload = new BasePayload()
  try {
    await payload.init({ config, disableDBConnect: true, disableOnInit: true })
    const pool = {
      async query(query: string | { text: string; rowMode?: string }, values?: unknown[]) {
        const text = typeof query === 'string' ? query : query.text
        const result = text.trim().startsWith('CREATE TYPE')
          ? (await database.exec(text)).at(-1)!
          : await database.query(text, values)
        const rows = result.rows.map((row) =>
          Object.fromEntries(
            Object.entries(row as Record<string, unknown>).map(([key, value]) => [
              key,
              value instanceof Date ? value.toISOString() : value,
            ]),
          ),
        )
        return {
          ...result,
          rows:
            typeof query === 'object' && query.rowMode === 'array'
              ? rows.map((row) => result.fields.map((field) => row[field.name]))
              : rows,
          rowCount: result.affectedRows || rows.length,
        }
      },
      async connect() {
        return this
      },
      release() {},
      prependListener() {},
      on() {},
      async end() {},
    }
    // A pg-compatible in-memory transport; the application uses its actual
    // PostgreSQL adapter, schema, hooks, validation and access-control pipeline.
    Object.assign(payload.db, { pool, push: true })
    await payload.db.connect!()
    // This fixture uses the current complete schema. Historical migration bridges
    // are exercised against legacy SQL in their dedicated migration tests.
    const req = await createLocalReq(
      { context: { disableRevalidate: true, languageMigration: true } },
      payload,
    )
    // A first-ever draft has no live global row and must not expose its URL.
    await payload.updateGlobal({slug:'search-settings', req, draft:true, data:{siteUrl:'https://first-draft.example', _status:'draft'}})
    expect((await payload.findGlobal({slug:'search-settings', draft:false})).siteUrl).not.toBe('https://first-draft.example')
    const firstDraftPublic = await createContentReader(payload).findGlobal({slug:'search-settings', locale:'zh', draft:false})
    expect(firstDraftPublic.siteUrl).toBeUndefined()
    expect(firstDraftPublic.allowIndexing).toBe(false)
    expect(firstDraftPublic.geo?.enabled).toBe(false)
    // Global configuration uses independent draft and live records.
    await payload.updateGlobal({slug: 'search-settings', req, data: {
      siteUrl: 'https://published.example', allowIndexing: false, allowCrawling: true, _status: 'published',
      robotsRules: [{userAgent: 'ExampleBot', allow: '/public', disallow: '/private'}],
    }})
    await payload.updateGlobal({slug: 'search-settings', req, draft: true, data: {
      siteUrl: 'https://draft.example', _status: 'draft',
    }})
    expect((await payload.findGlobal({slug:'search-settings', draft:false})).siteUrl).toBe('https://published.example')
    expect((await payload.findGlobal({slug:'search-settings', draft:true})).siteUrl).toBe('https://draft.example')
    expect((await payload.findGlobalVersions({slug:'search-settings'})).totalDocs).toBeGreaterThanOrEqual(2)
    // Payload's raw global API returns the base row even after withdrawal.
    // The public reader must explicitly reject its now-unpublished fields.
    await payload.updateGlobal({slug:'search-settings', req, draft:false, data:{siteUrl:'https://withdrawn.example', _status:'draft'}})
    expect((await payload.findGlobal({slug:'search-settings', draft:false})).siteUrl).toBe('https://withdrawn.example')
    const withdrawn = await createContentReader(payload).findGlobal({slug:'search-settings', locale:'zh', draft:false})
    expect(withdrawn.siteUrl).toBeUndefined()
    expect(withdrawn.robotsRules).toBeUndefined()
    expect(withdrawn.sitemap?.enabled).toBe(false)
    expect(withdrawn.allowIndexing).toBe(false)
    expect(withdrawn.allowCrawling).toBe(false)
    expect(withdrawn.geo?.enabled).toBe(false)
    await payload.updateGlobal({slug:'search-settings', req, data:{siteUrl:'https://published.example', _status:'published'}})

    await expect(payload.updateGlobal({slug:'search-settings', req, data:{robotsRules:[{userAgent:'*', disallow:'/'}]}})).rejects.toThrow()
    await expect(payload.updateGlobal({slug:'search-settings', req, data:{robotsRules:[{userAgent:'ExampleBot', disallow:'Sitemap: https://untrusted.example'}]}})).rejects.toThrow()
    await expect(payload.updateGlobal({slug:'search-settings', req, data:{robotsRules:[{userAgent:'ExampleBot'},{userAgent:'examplebot'}]}})).rejects.toThrow()
    const language = await payload.create({
      collection: 'languages',
      req,
      data: { code: 'ja', label: '日本語', enabled: true, direction: 'ltr' },
    })
    const product = await payload.create({
      collection: 'products',
      req,
      data: { slug: 'test-dog-bowl', pricing: { unit: 'piece', stock: 12 } },
    })
    const translation = await payload.create({
      collection: 'products-translations',
      req,
      draft: true,
      data: { subject: product.id, language: language.id, title: '犬用ボウル', _status: 'draft' },
    })
    const reader = createContentReader(payload)
    expect(
      (await reader.find({ collection: 'products', locale: 'ja', depth: 0 })).docs,
    ).toHaveLength(0)
    await payload.update({
      collection: 'products-translations',
      id: translation.id,
      req,
      data: { _status: 'published' },
    })
    const first = await reader.find({
      collection: 'products',
      locale: 'ja',
      depth: 0,
      where: { 'pricing.sku': { exists: false }, title: { like: '犬' } },
      sort: '-pricing.stock',
    })
    expect(first.docs[0]).toMatchObject({
      id: product.id,
      title: '犬用ボウル',
      pricing: { stock: 12 },
    })
    await payload.update({
      collection: 'products-translations',
      id: translation.id,
      req,
      draft: true,
      data: { title: '未公開の変更', _status: 'draft' },
    })
    expect(
      (await reader.findByID({ collection: 'products', id: product.id, locale: 'ja', depth: 0 }))
        .title,
    ).toBe('犬用ボウル')
    await payload.update({
      collection: 'products',
      id: product.id,
      req,
      data: { pricing: { stock: 8 } },
    })
    expect(
      (await reader.findByID({ collection: 'products', id: product.id, locale: 'ja', depth: 0 }))
        .pricing?.stock,
    ).toBe(8)
    await payload.update({
      collection: 'products-translations',
      id: translation.id,
      req,
      draft: false,
      data: { _status: 'draft' },
    })
    expect(
      (await reader.find({ collection: 'products', locale: 'ja', depth: 0 })).docs,
    ).toHaveLength(0)
    await expect(payload.find({ collection: 'products', overrideAccess: false })).rejects.toThrow()
    const normal = await createLocalReq({ context: { disableRevalidate: true } }, payload)
    await expect(
      payload.create({
        collection: 'languages',
        req: normal,
        data: { code: 'fr', label: 'Français', direction: 'ltr', enabled: true },
      }),
    ).rejects.toThrow('请先保存')
    await expect(
      payload.update({
        collection: 'languages',
        id: language.id,
        req: normal,
        data: { code: 'de' },
      }),
    ).rejects.toThrow('不可修改')
    const article = await payload.create({
      collection: 'posts',
      locale: 'zh',
      req,
      data: {
        slug: 'legacy-article',
        title: '旧文章',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: '旧文章正文',
                    format: 0,
                    detail: 0,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        _status: 'published',
      },
    })
    await payload.updateGlobal({
      slug: 'search-settings',
      req,
      locale: 'en',
      data: { siteName: 'Legacy brand', description: 'Existing English search description' },
    })
    const report = await migrateLanguageContent(payload, true)
    expect(
      report.some(
        (item) =>
          item.source === 'search-settings' && item.locale === 'en' && item.action === 'draft',
      ),
    ).toBe(true)
    expect(
      report.some(
        (item) =>
          item.source === 'posts' &&
          item.subject === article.id &&
          item.locale === 'zh' &&
          item.action === 'published',
      ),
    ).toBe(true)
    expect(
      (await reader.findByID({ collection: 'posts', id: article.id, locale: 'zh', depth: 0 }))
        .title,
    ).toBe('旧文章')
    const repeat = await migrateLanguageContent(payload, true)
    expect(
      repeat.some(
        (item) =>
          item.source === 'posts' &&
          item.subject === article.id &&
          item.locale === 'zh' &&
          item.action === 'keep-existing',
      ),
    ).toBe(true)
    await payload.jobs.queue({
      task: 'schedulePublish',
      input: {
        doc: { relationTo: 'products-translations', value: translation.id },
        type: 'publish',
      },
    })
    await payload.jobs.run({ allQueues: true })
    expect(
      (await reader.find({ collection: 'products', locale: 'ja', depth: 0 })).docs,
    ).toHaveLength(1)
    expect(
      (await payload.find({ collection: 'products-translations', overrideAccess: false, depth: 0 }))
        .docs,
    ).toHaveLength(1)
    await payload.update({
      collection: 'languages',
      id: language.id,
      req: normal,
      data: { enabled: false },
    })
    expect(
      (await reader.find({ collection: 'products', locale: 'ja', depth: 0 })).docs,
    ).toHaveLength(0)
    expect(
      (await payload.find({ collection: 'products-translations', overrideAccess: false, depth: 0 }))
        .docs,
    ).toHaveLength(0)
    await expect(
      payload.delete({ collection: 'languages', id: language.id, req: normal }),
    ).rejects.toThrow('关联翻译')
    const emptyLanguage = await payload.create({
      collection: 'languages',
      data: { code: 'de', label: 'Deutsch', enabled: false, direction: 'ltr' },
    })
    await expect(
      payload.delete({ collection: 'languages', id: emptyLanguage.id, overrideAccess: false }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'languages', id: emptyLanguage.id })
    expect(
      (await payload.find({ collection: 'languages', where: { code: { equals: 'de' } } })).docs,
    ).toHaveLength(0)
    const configuredLanguage = await payload.create({
      collection: 'languages',
      data: { code: 'fr', label: 'Français', enabled: false, direction: 'ltr' },
    })
    const copy = await payload.create({
      collection: 'site-copy',
      req,
      data: { language: configuredLanguage.id, messages: enMessages, _status: 'published' },
    })
    const header = await payload.create({
      collection: 'header-translations',
      req,
      data: {
        subject: 'header',
        language: configuredLanguage.id,
        navItems: [],
        _status: 'published',
      },
    })
    const footer = await payload.create({
      collection: 'footer-translations',
      req,
      data: { subject: 'footer', language: configuredLanguage.id, navItems: [], _status: 'draft' },
      draft: true,
    })
    const searchSettings = await payload.create({
      collection: 'search-settings-translations',
      req,
      data: {
        subject: 'search-settings',
        language: configuredLanguage.id,
        siteName: 'Test',
        _status: 'published',
      },
    })
    const scheduledCopy = await payload.jobs.queue({
      task: 'schedulePublish',
      input: { doc: { relationTo: 'site-copy', value: copy.id }, type: 'publish' },
      waitUntil: new Date(Date.now() + 86400000),
    })
    const unrelatedJob = await payload.jobs.queue({
      task: 'schedulePublish',
      input: {
        doc: { relationTo: 'products-translations', value: translation.id },
        type: 'publish',
      },
      waitUntil: new Date(Date.now() + 86400000),
    })
    await payload.delete({ collection: 'languages', id: configuredLanguage.id, req: normal })
    for (const [collection, id] of [
      ['site-copy', copy.id],
      ['header-translations', header.id],
      ['footer-translations', footer.id],
      ['search-settings-translations', searchSettings.id],
    ] as const) {
      expect(
        (await payload.find({ collection, draft: true, where: { id: { equals: id } } })).docs,
      ).toHaveLength(0)
      expect(
        (await payload.findVersions({ collection, where: { parent: { equals: id } } })).docs,
      ).toHaveLength(0)
    }
    expect(
      (
        await payload.find({
          collection: 'payload-jobs',
          where: { id: { equals: scheduledCopy.id } },
        })
      ).docs,
    ).toHaveLength(0)
    expect(
      (
        await payload.find({
          collection: 'payload-jobs',
          where: { id: { equals: unrelatedJob.id } },
        })
      ).docs,
    ).toHaveLength(1)
    normal.query = { ...normal.query, clearRelated: 'true' }
    await payload.delete({ collection: 'languages', id: language.id, req: normal })
    expect(
      (
        await payload.find({
          collection: 'products-translations',
          draft: true,
          where: { language: { equals: language.id } },
        })
      ).docs,
    ).toHaveLength(0)
    expect(
      (
        await payload.findVersions({
          collection: 'products-translations',
          where: { parent: { equals: translation.id } },
        })
      ).docs,
    ).toHaveLength(0)
    expect((await payload.findByID({ collection: 'products', id: product.id })).id).toBe(product.id)
    expect(
      (
        await payload.find({
          collection: 'payload-jobs',
          where: { id: { equals: unrelatedJob.id } },
        })
      ).docs,
    ).toHaveLength(0)
    const settings = await payload.findGlobal({ slug: 'language-settings', depth: 0 })
    await expect(
      payload.delete({ collection: 'languages', id: settings.defaultLanguage as number }),
    ).rejects.toThrow('默认语言')
  } finally {
    await database.close()
  }
}, 60000)
