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
      const yueliMigration = await sqlFrom('20261030_001800_yueli_translation_fields')
      await db.exec(yueliMigration)
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
      await db.exec(
        `UPDATE tr_posts SET migration_content_h_t_m_l = '<p>Original Yueli article</p>', migration_attributes = '{"model":"TA-12"}'`,
      )
      await db.exec(yueliMigration)
      expect(
        (await db.query('SELECT migration_content_h_t_m_l, migration_attributes FROM tr_posts'))
          .rows,
      ).toEqual([
        {
          migration_content_h_t_m_l: '<p>Original Yueli article</p>',
          migration_attributes: { model: 'TA-12' },
        },
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
