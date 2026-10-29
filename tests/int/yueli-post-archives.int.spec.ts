import { describe, expect, it, vi } from 'vitest'
import type { Category, Post } from '../../src/payload-types'
import taxonomy from '../../src/data/yueli-taxonomy.json'

vi.mock('../../src/components/Yueli/data', () => ({
  getPosts: vi.fn(),
  getYueli: vi.fn(),
  contentPath: vi.fn(),
  imageURL: vi.fn(),
}))
vi.mock('../../src/components/Yueli/Breadcrumbs', () => ({ Breadcrumbs: vi.fn() }))
vi.mock('../../src/components/Yueli/metadata', () => ({ equipmentMetadata: vi.fn() }))

import { postArchiveState } from '../../src/components/Yueli/PostArchive'
import {
  normalizePostTaxonomies,
  postsInArchive,
  postTaxonomiesForPost,
} from '../../src/components/Yueli/postTaxonomy'

describe('preserved WordPress article archives', () => {
  it('retains every indexed source category and tag with valid article associations', () => {
    expect(taxonomy.categories.filter((term) => term.count > 0)).toHaveLength(5)
    expect(normalizePostTaxonomies('tag', [])).toHaveLength(24)
    for (const kind of ['category', 'tag'] as const) {
      const field = kind === 'category' ? 'categories' : 'tags'
      const terms = normalizePostTaxonomies(kind, [])
      for (const post of taxonomy.posts)
        for (const id of post[field]) expect(terms.some((term) => term.id === id)).toBe(true)
      expect(new Set(terms.map((term) => term.path)).size).toBe(terms.length)
      expect(terms.every((term) => term.path.startsWith(`/${kind}/`))).toBe(true)
    }
  })

  it('uses live published Payload content while retaining source archive membership after edits', () => {
    const source = taxonomy.posts.find((post) => post.categories.length && post.tags.length)!
    const published = {
      id: 991,
      _status: 'published',
      title: 'Title edited in Payload',
      slug: 'edited-slug',
      migration: { sourceId: source.id },
    } as Post
    const draft = { ...published, id: 992, _status: 'draft' } as Post
    const unrelated = { ...published, id: 993, migration: { sourceId: -1 } } as Post
    const unimported = { ...published, id: 994, migration: undefined } as Post
    for (const kind of ['category', 'tag'] as const) {
      const termID = kind === 'category' ? source.categories[0] : source.tags[0]
      const term = normalizePostTaxonomies(kind, []).find((item) => item.sourceID === termID)!
      expect(postsInArchive(kind, term, [published, draft, unrelated, unimported])).toEqual([
        published,
      ])
    }
  })

  it('uses editable taxonomy records for new posts and respects cleared associations without snapshot resurrection', () => {
    const source = taxonomy.posts.find((post) => post.categories.length)!
    const records = [
      {
        id: 500,
        title: 'Edited technical guides',
        slug: 'edited-guides',
        taxonomy: 'post-category',
        description: 'Editorial description from Payload.',
        migration: {
          sourceId: source.categories[0],
          sourcePath: '/category/technical-support-guides',
        },
      },
    ] as Category[]
    const definitions = normalizePostTaxonomies('category', records)
    expect(definitions).toHaveLength(1)
    expect(definitions[0]).toMatchObject({
      id: 500,
      title: 'Edited technical guides',
      path: '/category/technical-support-guides',
      fromSnapshot: false,
    })
    const newPost = { id: 800, _status: 'published', categories: [500] } as Post
    const populated = { ...newPost, id: 801, categories: records } as Post
    const cleared = {
      ...newPost,
      id: 802,
      categories: [],
      migration: { sourceId: source.id },
    } as Post
    expect(postsInArchive('category', definitions[0], [newPost, populated, cleared])).toEqual([
      newPost,
      populated,
    ])
    expect(postTaxonomiesForPost('category', cleared, definitions)).toEqual([])
    expect(
      normalizePostTaxonomies('tag', [
        { id: 501, slug: 'new-tag', title: 'New tag' } as Category,
      ])[0].path,
    ).toBe('/tag/new-tag')
  })

  it('supports real pagination and rejects malformed or nonexistent archive pages', () => {
    expect(postArchiveState(25, { page: '3' })).toMatchObject({
      page: 3,
      pages: 3,
      valid: true,
      noIndex: false,
    })
    expect(postArchiveState(3, { page: '2' }).valid).toBe(false)
    for (const page of ['0', '-1', '1.5', '2extra', ['1', '2']])
      expect(postArchiveState(25, { page }).valid).toBe(false)
    expect(postArchiveState(0, {})).toMatchObject({ page: 1, valid: true, noIndex: true })
    expect(postArchiveState(0, { page: '2' }).valid).toBe(false)
  })
})
