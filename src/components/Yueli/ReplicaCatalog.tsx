import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  getProducts,
  getCategories,
  imageURL,
  categoryIDs,
  categoryBranch,
  contentPath,
} from './data'
import { Breadcrumbs } from './Breadcrumbs'
import { categoryTrail } from './architecture'
import { parseCatalogPage } from './catalogSEO'
import type { SearchParams } from './Views'
import source from '@/data/yueli.json'

const firstPage = [1708, 1710, 1712, 2436, 1716, 2290, 2450, 1718, 1724, 1714, 1727, 1709]
const categoryLinks = [
  ['Tapping Machines', 'tapping-machine'],
  ['Drilling, Tapping & Milling', 'drilling-tapping-milling-machine'],
  ['CNC Machining Centers', 'cnc-machining-center'],
  ['Lathe Machines', 'lathe-machine'],
  ['Polishing', 'sand-belt-polishing-machine'],
  ['Accessories', 'machine-accessories'],
]

export async function ReplicaCatalog({
  categorySlug,
  searchParams = {},
}: {
  categorySlug?: string
  searchParams?: SearchParams
}) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const selected =
    categorySlug ||
    (typeof searchParams.category === 'string'
      ? searchParams.category
      : typeof searchParams.product_cat === 'string'
        ? searchParams.product_cat
        : '')
  const category = selected ? categories.find((item) => item.slug === selected) : undefined
  if (selected && !category) notFound()
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 200) : ''
  const ids = category ? categoryBranch(category.id, categories) : null
  const order = [
    ...firstPage,
    ...source.products
      .map((item) => item.id)
      .filter((id) => !firstPage.includes(id))
      .sort((a, b) => a - b),
  ]
  const rank = (id?: number | null) => {
    const index = order.indexOf(id || -1)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }
  const matches = products
    .filter(
      (product) =>
        (!ids || categoryIDs(product).some((id) => ids.has(id))) &&
        (!q ||
          `${product.title} ${product.general?.shortDescription || ''} ${product.pricing?.sku || ''}`
            .toLowerCase()
            .includes(q.toLowerCase())),
    )
    .sort((a, b) => rank(a.migration?.sourceId) - rank(b.migration?.sourceId))
  const page = parseCatalogPage(searchParams['product-page'] ?? searchParams.page)
  if (!page) notFound()
  const totalPages = Math.ceil(matches.length / 12)
  if (page > Math.max(1, totalPages)) notFound()
  const shown = matches.slice((page - 1) * 12, page * 12)
  const base = category ? contentPath(category, 'category') : '/products'
  const pageURL = (number: number) => {
    const query = new URLSearchParams()
    if (q) query.set('q', q)
    if (number > 1) query.set('product-page', String(number))
    return `${base}${query.size ? `?${query}` : ''}`
  }
  return (
    <div className="yl-replica-catalog yl-wrap">
      {category ? (
        <>
          <Breadcrumbs
            items={[
              { name: 'Products', href: '/products' },
              ...categoryTrail(category, categories).map((item) => ({
                name: item.title,
                href: contentPath(item, 'category'),
              })),
            ]}
          />
          <h1>{category.title}</h1>
        </>
      ) : (
        <>
          <h1>Browse by Product Category</h1>
          <p className="yl-catalog-lead">
            Explore available Yueli machine models and supporting components. Use the category links
            to narrow the catalog by process and equipment type.
          </p>
        </>
      )}
      <nav className="yl-category-rail" aria-label="Product categories">
        {categoryLinks.map(([title, slug]) => {
          const item = categories.find((item) => item.slug === slug)
          return item ? (
            <a key={slug} href={contentPath(item, 'category')}>
              {title}
            </a>
          ) : null
        })}
      </nav>
      {q && (
        <form role="search" className="yl-catalog-search" action={base}>
          <label htmlFor="equipment-search">Search equipment</label>
          <div>
            <input id="equipment-search" name="q" type="search" defaultValue={q} />
            <button className="yl-button" type="submit">
              Search
            </button>
          </div>
        </form>
      )}
      <p className="yl-replica-result-count" role="status">
        {matches.length
          ? `Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, matches.length)} of ${matches.length} results`
          : 'No products were found matching your selection.'}
        {q && (
          <>
            {' '}
            for “{q}” · <a href="/products">Clear search</a>
          </>
        )}
      </p>
      {shown.length ? (
        <div className="yl-replica-product-grid">
          {shown.map((product) => (
            <article className="yl-replica-product" key={product.id}>
              <a href={contentPath(product, 'product')}>
                <div className="yl-replica-product-image">
                  {imageURL(product.general?.heroImage) && (
                    <Image
                      src={imageURL(product.general?.heroImage)}
                      alt={product.title}
                      width={600}
                      height={450}
                      sizes="(max-width:600px) 90vw, (max-width:900px) 45vw, 22vw"
                    />
                  )}
                </div>
                <h2>{product.title}</h2>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="yl-empty">
          <p>Contact Yueli for help selecting equipment for your workpiece.</p>
          <a href="/contact-us" className="yl-button">
            Contact Us
          </a>
        </div>
      )}
      {totalPages > 1 && (
        <nav className="yl-pagination" aria-label="Product pages">
          {page > 1 && (
            <a href={pageURL(page - 1)} aria-label="Previous page">
              ←
            </a>
          )}
          {Array.from({ length: totalPages }, (_, index) => (
            <a
              key={index}
              href={pageURL(index + 1)}
              aria-current={page === index + 1 ? 'page' : undefined}
            >
              {index + 1}
            </a>
          ))}
          {page < totalPages && (
            <a href={pageURL(page + 1)} aria-label="Next page">
              →
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
