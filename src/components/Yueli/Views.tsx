import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Post } from '@/payload-types'
import { getYueli, getPosts, getPages, imageURL, contentPath } from './data'
import { ReplicaHome } from './ReplicaHome'
import { SourceLayout } from './SourceLayout'
import { EquipmentInquiryForm } from './InquiryForm'
import { safeHTML, plainText } from './html'
import { Breadcrumbs } from './Breadcrumbs'

export { EquipmentCard } from './EquipmentCard'

export async function YueliHome() {
  return <ReplicaHome />
}
function PageIntro({
  title,
  description,
  breadcrumb,
  trail,
}: {
  title: string
  description?: string
  breadcrumb?: string
  trail?: { name: string; href: string }[]
}) {
  return (
    <section className="yl-page-intro">
      <div className="yl-wrap">
        {trail ? (
          <Breadcrumbs items={trail} />
        ) : (
          <nav className="yl-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            {breadcrumb && (
              <>
                <a href="/products/">Products</a>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span>{breadcrumb || title}</span>
          </nav>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  )
}
export type SearchParams = Record<string, string | string[] | undefined>
export { ReplicaCatalog as EquipmentCatalog } from './ReplicaCatalog'
export { ReplicaProduct as ProductView } from './ReplicaProduct'
function PostCard({ post }: { post: Post }) {
  return (
    <article className="yl-post-card">
      <a href={contentPath(post, 'post')} className="yl-post-image">
        {imageURL(post.heroImage) && (
          <Image
            src={imageURL(post.heroImage)}
            alt={post.title}
            fill
            sizes="(max-width:760px) 92vw, 32vw"
          />
        )}
      </a>
      <time dateTime={post.publishedAt || undefined}>
        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
      <h2>
        <a href={contentPath(post, 'post')}>{post.title}</a>
      </h2>
      <p>{plainText(post.migration?.summary || post.meta?.description || '')}</p>
      <a className="yl-text-link" href={contentPath(post, 'post')}>
        Read article ↗
      </a>
    </article>
  )
}
export async function BlogView() {
  const page = (await getPages()).find((item) => item.slug === 'blog')
  if (page?.migration?.contentHTML?.includes('yb-blog'))
    return <SourceLayout html={page.migration.contentHTML} />
  const posts = await getPosts()
  return (
    <>
      <PageIntro
        title="Articles and company updates"
        description="Equipment selection guidance, manufacturing updates and practical information for your next project."
        trail={[
          { name: 'Resources', href: '/resources' },
          { name: 'Articles', href: '/blog' },
        ]}
      />
      <section className="yl-wrap yl-section">
        {posts.length ? (
          <div className="yl-blog-grid">
            {posts.map((post) => (
              <PostCard post={post} key={post.id} />
            ))}
          </div>
        ) : (
          <div className="yl-empty">
            New articles are being prepared. Contact Yueli for technical guidance.
          </div>
        )}
      </section>
    </>
  )
}
export { ReplicaArticle as ArticleView } from './ReplicaArticle'
export async function SourcePage({ path }: { path: string }) {
  const pages = await getPages()
  const page = pages.find((p) => contentPath(p, 'page') === path)
  if (!page) notFound()
  if (/class="(?:ya-about|yf-faq|yc-contact|yb-blog)/.test(page.migration?.contentHTML || ''))
    return <SourceLayout html={page.migration!.contentHTML!} />
  return (
    <>
      <PageIntro title={page.title} trail={[{ name: page.title, href: path }]} />
      <section className="yl-wrap yl-section">
        <div
          className="yl-source-content yl-information-content"
          dangerouslySetInnerHTML={{ __html: safeHTML(page.migration?.contentHTML) }}
        />
        <div className="yl-proof-links">
          <h2>Continue your equipment review</h2>
          <a href="/manufacturing">Manufacturing and verification</a>
          <a href="/resources/prepare-equipment-rfq">Prepare your project brief</a>
          <a href="/contact-us">Contact Yueli</a>
        </div>
      </section>
    </>
  )
}
export async function ContactView({ product, project }: { product?: string; project?: string }) {
  const { site } = await getYueli()
  const formID = typeof site.inquiryForm === 'object' ? site.inquiryForm?.id : site.inquiryForm
  const page = (await getPages()).find((item) => item.slug === 'contact-us')
  if (page?.migration?.contentHTML?.includes('yc-contact'))
    return (
      <SourceLayout
        html={page.migration.contentHTML}
        formID={formID}
        product={product}
        project={project}
      />
    )
  return (
    <>
      <PageIntro
        title="Contact Yueli Automation"
        description="Request equipment information, discuss a custom automation project, or contact our after-sales team."
        trail={[{ name: 'Contact', href: '/contact-us' }]}
      />
      <section className="yl-wrap yl-section yl-contact-grid">
        <div>
          <h2>
            Start with your
            <br />
            workpiece and process.
          </h2>
          <p>
            Send the information you have. Our team will help identify the equipment route and
            project details that still need review.
          </p>
          <p className="yl-small">
            For after-sales support, include your machine model and the issue you are experiencing.
          </p>
          <div className="yl-selection-note">
            <h3>Prepare the brief</h3>
            <p>
              Include material, key dimensions, required operations, target output and destination
              country. Send drawings through the contact email; this form accepts text.
            </p>
            <a href="/resources/prepare-equipment-rfq">Read the equipment RFQ checklist ↗</a>
          </div>
        </div>
        <div className="yl-contact-form-panel">
          <h2>Project Inquiry</h2>
          <EquipmentInquiryForm formID={formID} product={product} project={project} />
        </div>
      </section>
      <section className="yl-wrap yl-section yl-next-steps">
        <h2>What happens after your inquiry?</h2>
        <ol>
          <li>
            <h3>Clarify the requirement</h3>
            <p>
              The discussion starts with your workpiece, required operations and information still
              needed for review.
            </p>
          </li>
          <li>
            <h3>Review the equipment scope</h3>
            <p>
              Discuss the configuration, fixtures, handling and verification requirements relevant
              to your project.
            </p>
          </li>
          <li>
            <h3>Confirm the proposal</h3>
            <p>
              Agree the scope and commercial terms before proceeding. Any schedule or performance
              commitment belongs in the confirmed proposal.
            </p>
          </li>
        </ol>
      </section>
    </>
  )
}
