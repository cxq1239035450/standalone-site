import Image from 'next/image'
import { notFound } from 'next/navigation'
import RichText from '@/components/RichText'
import { getPostArchiveDefinitions, postTaxonomiesForPost, postsInArchive } from './postTaxonomy'
import { getPosts, getYueli, imageURL, contentPath } from './data'
import { safeHTML } from './html'
import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'

export async function ReplicaArticle({ path, slug }: { path?: string; slug?: string }) {
  const [posts, { site }, settings, categoryDefinitions, tagDefinitions] = await Promise.all([
    getPosts(),
    getYueli(),
    getSearchSettings('en'),
    getPostArchiveDefinitions('category'),
    getPostArchiveDefinitions('tag'),
  ])
  const post = posts.find((item) =>
    path ? contentPath(item, 'post') === path : item.slug === slug,
  )
  if (!post) notFound()
  const categories = postTaxonomiesForPost('category', post, categoryDefinitions)
  const tags = postTaxonomiesForPost('tag', post, tagDefinitions)
  return (
    <article className="yl-wrap yl-replica-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            url: siteOrigin(settings.siteUrl) + contentPath(post, 'post'),
            publisher: { '@id': `${siteOrigin(settings.siteUrl)}/#organization` },
          }),
        }}
      />
      <header className="yl-article-heading">
        <h1>{post.title}</h1>
        <p>
          <span>yueli</span>
          <time dateTime={post.publishedAt || post.createdAt}>
            {(post.publishedAt || post.createdAt).slice(0, 10)}
          </time>
          {categories.map((category) => (
            <a key={category.id} href={category.path}>
              {category.title}
            </a>
          ))}
        </p>
      </header>
      <div className="yl-article-columns">
        <div>
          <div className="yl-source-content">
            {post.migration?.contentHTML ? (
              <div dangerouslySetInnerHTML={{ __html: safeHTML(post.migration.contentHTML) }} />
            ) : (
              <RichText data={post.content} enableGutter={false} />
            )}
          </div>
          {tags.length > 0 && (
            <div className="yl-article-tags">
              <strong>Tags :</strong>
              {tags.map((tag) => (
                <a href={tag.path} key={tag.id}>
                  {tag.title}
                </a>
              ))}
            </div>
          )}
        </div>
        <aside className="yl-article-sidebar">
          <section>
            <h2>Categories</h2>
            {categoryDefinitions
              .filter((item) => postsInArchive('category', item, posts).length > 0)
              .map((category) => (
                <a href={category.path} key={category.id}>
                  {category.title}
                </a>
              ))}
          </section>
          <section>
            <h2>Recent Posts</h2>
            {posts.slice(0, 3).map((recent) => (
              <a className="yl-recent-post" href={contentPath(recent, 'post')} key={recent.id}>
                {imageURL(recent.heroImage) && (
                  <Image src={imageURL(recent.heroImage)} alt="" width={80} height={64} />
                )}
                <span>{recent.title}</span>
              </a>
            ))}
          </section>
          <section className="yl-article-advice">
            <h2>Need Expert Advice?</h2>
            <p>
              Looking for high-precision CNC machines or custom automation solutions? Contact our
              engineering team today for a tailored quote and instant technical support.
            </p>
            <a href={`tel:${site.telephone.replace(/\s/g, '')}`}>{site.telephone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </section>
        </aside>
      </div>
    </article>
  )
}
