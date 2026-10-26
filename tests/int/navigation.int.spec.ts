import { describe, expect, it } from 'vitest'
import { navigationLinks } from '../../src/utilities/navigationLinks'
import type { Header } from '../../src/payload-types'

describe('Configured public navigation', () => {
  it('omits unsafe URLs, placeholders and unresolved page references', () => {
    const items = [
      { link: { type: 'custom', label: 'Script', url: 'javascript:alert(1)' } },
      { link: { type: 'custom', label: 'Placeholder', url: '#' } },
      { link: { type: 'custom', label: 'Backslash', url: '/\\evil.test' } },
      { link: { type: 'reference', label: 'Deleted', reference: { relationTo: 'pages', value: 123 } } },
      { link: { type: 'custom', label: 'Catalog', url: '/products', newTab: true } },
    ] as Header['navItems']
    expect(navigationLinks(items)).toEqual([{ title: 'Catalog', href: '/products', newTab: true }])
  })

  it('resolves the home page and encodes article slugs', () => {
    const items = [
      { link: { type: 'reference', label: 'Home', reference: { relationTo: 'pages', value: { slug: 'home', title: 'Home', _status: 'published' } } } },
      { link: { type: 'reference', label: 'Guide', reference: { relationTo: 'posts', value: { slug: 'care & feeding', title: 'Guide', _status: 'published' } } } },
      { link: { type: 'reference', label: 'Draft', reference: { relationTo: 'posts', value: { slug: 'draft', title: 'Draft', _status: 'draft' } } } },
      { link: { type: 'reference', label: 'Untranslated', reference: { relationTo: 'posts', value: { slug: 'guide', title: '', _status: 'published' } } } },
    ] as Header['navItems']
    expect(navigationLinks(items)).toEqual([
      { title: 'Home', href: '/', newTab: false },
      { title: 'Guide', href: '/posts/care%20%26%20feeding', newTab: false },
    ])
  })
})
