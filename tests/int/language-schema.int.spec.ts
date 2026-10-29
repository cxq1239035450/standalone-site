// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs/promises'

describe('Additive multilingual PostgreSQL schema', () => {
  it('preserves legacy article data, permits arbitrary languages, and is repeatable', async () => {
    const db = new PGlite()
    try {
      const sqlFrom = async (name: string) =>
        (await fs.readFile(`src/migrations/${name}.ts`, 'utf8')).match(/sql`([\s\S]*?)`/)![1]
      await db.exec(await sqlFrom('20260818_035022'))
      await db.exec(
        `INSERT INTO posts (id, title, content, slug, _status) VALUES (901, 'Original title', '{"root":{"children":[]}}', 'original', 'published')`,
      )
      const migration = await sqlFrom('20261028_143927_dynamic_languages')
      await db.exec(migration)
      await db.exec(migration)
      expect((await db.query('SELECT title FROM posts WHERE id = 901')).rows).toEqual([
        { title: 'Original title' },
      ])
      expect(
        (await db.query('SELECT title, _locale, _status FROM posts_locales WHERE _parent_id = 901'))
          .rows,
      ).toEqual([{ title: 'Original title', _locale: 'zh', _status: 'published' }])
      await db.exec(
        `INSERT INTO languages (id, code, label, enabled, direction) VALUES (1, 'ja', '日本語', false, 'ltr'); INSERT INTO tr_posts (subject_id, language_id, title, _status) VALUES (901, 1, '日本語の記事', 'draft')`,
      )
      expect((await db.query('SELECT title FROM tr_posts')).rows).toEqual([
        { title: '日本語の記事' },
      ])
      await expect(
        db.exec(
          `INSERT INTO tr_posts (subject_id, language_id, title) VALUES (901, 1, 'Duplicate')`,
        ),
      ).rejects.toThrow()
    } finally {
      await db.close()
    }
  }, 60000)
})


describe('SEO configuration migration', () => {
  it('preserves live settings, archived translated data and a published version', async () => {
    const db = new PGlite()
    try {
      const sqlFrom = async (name: string) =>
        (await fs.readFile(`src/migrations/${name}.ts`, 'utf8')).match(/sql`([\s\S]*?)`/)![1]
      await db.exec(await sqlFrom('20260818_035022'))
      await db.exec(await sqlFrom('20261028_143927_dynamic_languages'))
      await db.exec(`
        INSERT INTO search_settings (id, site_name, site_url, allow_indexing) VALUES (1, 'Existing brand', 'https://existing.example', false);
        INSERT INTO search_settings_locales (_parent_id, _locale, description, geo_summary) VALUES (1, 'zh', '原始描述', '原始简介');
        INSERT INTO search_settings_organization_same_as (_parent_id, _order, id, url) VALUES (1, 1, 'social-one', 'https://social.example');
        INSERT INTO search_settings_geo_faq (_parent_id, _order, _locale, id, question, answer) VALUES (1, 1, 'zh', 'faq-one', '原始问题', '原始回答');
      `)
      await db.exec(await sqlFrom('20261029_171455_seo_discovery'))
      expect((await db.query('SELECT site_name, site_url, _status, allow_crawling FROM search_settings')).rows).toEqual([
        {site_name:'Existing brand', site_url:'https://existing.example', _status:'published', allow_crawling:false},
      ])
      expect((await db.query('SELECT version_site_url, version__status, latest FROM _search_settings_v')).rows).toEqual([
        {version_site_url:'https://existing.example', version__status:'published', latest:true},
      ])
      expect((await db.query('SELECT version_description FROM _search_settings_v_locales')).rows).toEqual([{version_description:'原始描述'}])
      expect((await db.query('SELECT question, answer, _uuid FROM _search_settings_v_version_geo_faq')).rows).toEqual([{question:'原始问题',answer:'原始回答',_uuid:'faq-one'}])
      expect((await db.query('SELECT url FROM _search_settings_v_version_organization_same_as')).rows).toEqual([{url:'https://social.example'}])
      expect((await db.query('SELECT description FROM search_settings_locales')).rows).toEqual([{description:'原始描述'}])
    } finally { await db.close() }
  }, 60000)
})
