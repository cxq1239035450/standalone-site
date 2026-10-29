// @vitest-environment node
import 'dotenv/config'
import { it, expect } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { BasePayload, createLocalReq } from 'payload'
import fs from 'node:fs/promises'
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'
import { migrateLanguageContent } from '@/i18n/migrateContent'

it('runs Japanese draft/publish/withdraw and shared inventory through the real Payload adapter', async () => {
  const database = new PGlite()
  const payload = new BasePayload()
  try {
    for (const name of ['20260818_035022', '20261028_143927_dynamic_languages']) {
      const source = await fs.readFile(`src/migrations/${name}.ts`, 'utf8')
      await database.exec(source.match(/sql`([\s\S]*?)`/)![1])
    }
    await payload.init({ config, disableDBConnect: true, disableOnInit: true })
    const pool = {
      async query(query: string | { text: string; rowMode?: string }, values?: unknown[]) {
        const text = typeof query === 'string' ? query : query.text
        const result = await database.query(text, values)
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
    Object.assign(payload.db, { pool })
    await payload.db.connect!()
    const req = await createLocalReq(
      { context: { disableRevalidate: true, languageMigration: true } },
      payload,
    )
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
    const report = await migrateLanguageContent(payload, true)
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
  } finally {
    await database.close()
  }
}, 60000)
