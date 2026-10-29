import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { parseCatalogPage, type CatalogQuery } from './catalogSEO'
import { contentPath, getPosts, imageURL } from './data'
import { plainText } from './html'
import { equipmentMetadata } from './metadata'
import { getPostArchiveDefinitions, postsInArchive, type PostArchiveKind } from './postTaxonomy'

export type { PostArchiveKind } from './postTaxonomy'
export const postArchivePageSize = 12
export { getPostArchiveDefinitions as postArchiveDefinitions, postsInArchive } from './postTaxonomy'

export function postArchiveState(total: number, query: CatalogQuery) {
  const page = parseCatalogPage(query.page)
  const pages = Math.max(1, Math.ceil(total / postArchivePageSize))
  return { page, pages, valid: page !== null && page <= pages, noIndex: total === 0 }
}

async function archiveData(kind: PostArchiveKind, slug: string, query: CatalogQuery) {
  const definitions = await getPostArchiveDefinitions(kind)
  const archive = definitions.find(
    (item) =>
      item.slug === slug ||
      decodeURIComponent(item.path.split('/').filter(Boolean).at(-1) || '') === slug,
  )
  if (!archive) return null
  const posts = postsInArchive(kind, archive, await getPosts())
  return { archive, posts, ...postArchiveState(posts.length, query) }
}

export async function postArchiveMetadata(
  kind: PostArchiveKind,
  slug: string,
  query: CatalogQuery = {},
) {
  const data = await archiveData(kind, slug, query)
  const path = data?.archive.path || `/${kind}/${encodeURIComponent(slug)}`
  const page = data?.page
  return equipmentMetadata(
    `${data?.archive.title || 'Article archive'}${page && page > 1 ? ` · Page ${page}` : ''}`,
    path + (data?.valid && page && page > 1 ? `?page=${page}` : ''),
    data?.archive.description ||
      `Yueli Automation articles about ${data?.archive.title || 'industrial equipment'}.`,
    undefined,
    !data || !data.valid || data.noIndex,
  )
}

export async function PostArchive({
  kind,
  slug,
  query = {},
}: {
  kind: PostArchiveKind
  slug: string
  query?: CatalogQuery
}) {
  const data = await archiveData(kind, slug, query)
  if (!data || !data.valid || data.page === null) notFound()
  const { archive, posts, page, pages } = data
  const shown = posts.slice((page - 1) * postArchivePageSize, page * postArchivePageSize)
  return (
    <>
      <section className="yl-page-intro">
        <div className="yl-wrap">
          <Breadcrumbs
            items={[
              { name: 'Blog', href: '/blog' },
              { name: archive.title, href: archive.path },
            ]}
          />
          <p className="yl-eyebrow">{kind === 'category' ? 'Article category' : 'Article tag'}</p>
          <h1>{archive.title}</h1>
          {archive.description && <p>{archive.description}</p>}
        </div>
      </section>
      <section className="yl-wrap yl-section">
        {shown.length ? (
          <div className="yl-blog-grid">
            {shown.map((post) => (
              <article className="yl-post-card" key={post.id}>
                {imageURL(post.heroImage) && (
                  <a href={contentPath(post, 'post')} className="yl-post-image">
                    <Image
                      src={imageURL(post.heroImage)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 760px) 92vw, 32vw"
                    />
                  </a>
                )}
                <time dateTime={post.publishedAt || post.createdAt}>
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
                <h2>
                  <a href={contentPath(post, 'post')}>{post.title}</a>
                </h2>
                <p>{plainText(post.migration?.summary || post.meta?.description || '')}</p>
                <a className="yl-text-link" href={contentPath(post, 'post')}>
                  Read article <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="yl-empty">
            <h2>No published articles in this archive yet.</h2>
            <a className="yl-text-link" href="/blog">
              Browse the Yueli blog <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
        {pages > 1 && (
          <nav className="yl-pagination" aria-label="Article archive pages">
            {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
              <a
                href={archive.path + (number > 1 ? `?page=${number}` : '')}
                key={number}
                aria-current={number === page ? 'page' : undefined}
              >
                {number}
              </a>
            ))}
          </nav>
        )}
      </section>
    </>
  )
}
