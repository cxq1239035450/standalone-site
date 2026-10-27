import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { jsonLd, getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import RichText from '@/components/RichText'
import type { Post, Product } from '@/payload-types'
import {
  getYueli,
  getProducts,
  getCategories,
  getPosts,
  getPages,
  imageURL,
  contentPath,
  categoryIDs,
  categoryBranch,
} from './data'
import { EquipmentHero } from './Hero'
import { EquipmentInquiryForm } from './InquiryForm'
import { EquipmentGallery } from './Gallery'
import { safeHTML, plainText } from './html'

export function EquipmentCard({ product }: { product: Product }) {
  const image = product.general?.heroImage
  return (
    <article className="yl-equipment-card">
      <Link
        href={contentPath(product, 'product')}
        className="yl-equipment-photo"
        tabIndex={-1}
        aria-hidden="true"
      >
        {imageURL(image) ? (
          <Image
            src={imageURL(image)}
            alt=""
            fill
            sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 26vw"
          />
        ) : (
          <span>Image being updated</span>
        )}
      </Link>
      <div className="yl-equipment-card-body">
        {product.pricing?.sku && <p className="yl-model">{product.pricing.sku}</p>}
        <h3>
          <Link href={contentPath(product, 'product')}>{product.title}</Link>
        </h3>
        {product.general?.shortDescription && <p>{plainText(product.general.shortDescription)}</p>}
        <Link className="yl-text-link" href={contentPath(product, 'product')}>
          View equipment <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  )
}
function InquiryPanel({ formID, product }: { formID?: number | null; product?: string }) {
  return (
    <section className="yl-inquiry-section" id="inquiry">
      <div className="yl-wrap yl-inquiry-grid">
        <div>
          <p className="yl-eyebrow">Start with the workpiece</p>
          <h2>
            Tell Us About
            <br />
            Your Application
          </h2>
          <p>
            Share a drawing or photo, material, key dimensions, required process, target output and
            destination country.
          </p>
          <Link className="yl-text-link" href="/contact-us/">
            Contact the Yueli team <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <EquipmentInquiryForm formID={formID} product={product} />
      </div>
    </section>
  )
}
export async function YueliHome() {
  const [{ site }, products, categories] = await Promise.all([
    getYueli(),
    getProducts(),
    getCategories(),
  ])
  const featured = products.filter((p) => p.organization?.featured).slice(0, 8)
  const populated = categories.filter((c) => products.some((p) => categoryIDs(p).includes(c.id)))
  const factory = (site.factoryImages || [])
    .filter((i) => !i.caption?.includes('campus'))
    .slice(0, 3)
  const formID = typeof site.inquiryForm === 'object' ? site.inquiryForm?.id : site.inquiryForm
  return (
    <>
      <EquipmentHero slides={site.slides} />
      <section className="yl-wrap yl-section yl-introduction">
        <div>
          <p className="yl-eyebrow">Engineering-led solutions</p>
          <h2>
            Automation Equipment
            <br />
            Built Around Your Process
          </h2>
        </div>
        <div>
          <p>{site.introduction}</p>
          <Link href="/about-us/" className="yl-text-link">
            About Yueli <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="yl-catalog-section">
        <div className="yl-wrap yl-section">
          <div className="yl-section-heading">
            <h2>
              Featured Machines for
              <br />
              Modern Manufacturing
            </h2>
            <Link href="/products/" className="yl-button yl-button-outline">
              View Products <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {featured.length ? (
            <div className="yl-product-grid yl-featured-grid">
              {featured.map((p) => (
                <EquipmentCard product={p} key={p.id} />
              ))}
            </div>
          ) : (
            <div className="yl-empty">
              The product catalog is being prepared. Contact our team for available equipment.
            </div>
          )}
          <div className="yl-category-strip">
            {populated.slice(0, 8).map((c) => (
              <Link href={contentPath(c, 'category')} key={c.id}>
                {c.title}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="yl-wrap yl-section">
        <h2>
          From Requirement
          <br />
          to Equipment Proposal
        </h2>
        <ol className="yl-process">
          {[
            [
              'Share Your Requirement',
              'Send a drawing or sample photo with material and key dimensions.',
            ],
            ['Process Review', 'Explain the required operations, tolerance and production target.'],
            ['Solution Discussion', 'Yueli reviews the requirement before recommending equipment.'],
            [
              'Project Follow-up',
              'Discuss configuration, verification, delivery and support for the confirmed scope.',
            ],
          ].map(([title, description], i) => (
            <li key={title}>
              <span className="yl-process-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>
      {factory.length > 0 && (
        <section className="yl-factory-section">
          <div className="yl-wrap yl-section">
            <h2>
              Built In-House.
              <br />
              Ready for Production.
            </h2>
            <div className="yl-factory-grid">
              {factory.map((image) => (
                <figure key={image.id}>
                  {imageURL(image.image) && (
                    <Image
                      src={imageURL(image.image)}
                      alt={image.caption || 'Yueli manufacturing'}
                      width={1100}
                      height={700}
                      sizes="(max-width: 760px) 92vw, 50vw"
                    />
                  )}
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
            <Link href="/about-us/" className="yl-text-link">
              Inside Yueli Production <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      )}
      {!!site.certificates?.length && (
        <section className="yl-wrap yl-section">
          <h2>Certificates &amp; Compliance</h2>
          <div className="yl-certificates">
            {site.certificates.map((cert) => (
              <a
                href={imageURL(cert.image)}
                key={cert.id}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${cert.caption || 'certificate'}`}
              >
                {imageURL(cert.image) && (
                  <Image
                    src={imageURL(cert.image)}
                    alt={cert.caption || 'Yueli certificate'}
                    width={210}
                    height={280}
                    sizes="170px"
                  />
                )}
              </a>
            ))}
          </div>
        </section>
      )}
      <InquiryPanel formID={formID} />
    </>
  )
}
function PageIntro({
  title,
  description,
  breadcrumb,
}: {
  title: string
  description?: string
  breadcrumb?: string
}) {
  return (
    <section className="yl-page-intro">
      <div className="yl-wrap">
        <nav className="yl-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          {breadcrumb && (
            <>
              <Link href="/products/">Products</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span>{breadcrumb || title}</span>
        </nav>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  )
}
export type SearchParams = Record<string, string | string[] | undefined>
export async function EquipmentCatalog({
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
  const category = selected ? categories.find((c) => c.slug === selected) : undefined
  if (categorySlug && !category) notFound()
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 200) : ''
  const categorySet = category ? categoryBranch(category.id, categories) : null
  const matches = products.filter(
    (p) =>
      (!categorySet || categoryIDs(p).some((id) => categorySet.has(id))) &&
      (!q ||
        `${p.title} ${p.pricing?.sku || ''} ${p.general?.shortDescription || ''}`
          .toLowerCase()
          .includes(q.toLowerCase())),
  )
  const page = Math.max(1, Number.parseInt(String(searchParams.page || '1'), 10) || 1)
  const size = 12,
    totalPages = Math.ceil(matches.length / size)
  const shown = matches.slice((page - 1) * size, page * size)
  const used = categories.filter((c) =>
    products.some((p) => categoryIDs(p).some((id) => categoryBranch(c.id, categories).has(id))),
  )
  const url = (page: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('page', String(page))
    return `${category ? contentPath(category, 'category') : '/products/'}?${params}`
  }
  return (
    <>
      <PageIntro
        title={category?.title || 'Equipment & Products'}
        description={
          category
            ? 'Browse available equipment in this category. Share your workpiece and requirements for a configuration review.'
            : 'Drilling, tapping, milling, CNC machining, casting, polishing, assembly and testing equipment.'
        }
        breadcrumb={category?.title}
      />
      <section className="yl-wrap yl-section yl-catalog-layout">
        <aside className="yl-catalog-sidebar">
          <h2>Equipment Categories</h2>
          <Link className={!category ? 'is-selected' : ''} href="/products/">
            All equipment <span>{products.length}</span>
          </Link>
          {used.map((c) => (
            <Link
              key={c.id}
              className={c.id === category?.id ? 'is-selected' : ''}
              href={contentPath(c, 'category')}
            >
              {c.title}
              <span>
                {
                  products.filter((p) =>
                    categoryIDs(p).some((id) => categoryBranch(c.id, categories).has(id)),
                  ).length
                }
              </span>
            </Link>
          ))}
          <div className="yl-sidebar-help">
            <h3>Start with your workpiece.</h3>
            <p>Not sure which machine fits? Send your drawing and required process.</p>
            <Link className="yl-text-link" href="/contact-us/">
              Get Quote ↗
            </Link>
          </div>
        </aside>
        <div>
          <form
            action={category ? contentPath(category, 'category') : '/products/'}
            className="yl-catalog-search"
            role="search"
          >
            <label htmlFor="equipment-search">Search equipment</label>
            <div>
              <input
                id="equipment-search"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Machine name, model or process"
              />
              <button className="yl-button" type="submit">
                Search
              </button>
            </div>
          </form>
          <form action="/products/" className="yl-mobile-categories">
            <label htmlFor="mobile-category">Category</label>
            <select id="mobile-category" name="category" defaultValue={category?.slug || ''}>
              <option value="">All equipment</option>
              {used.map((c) => (
                <option value={c.slug || ''} key={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button className="yl-button yl-button-outline" type="submit">
              Apply
            </button>
          </form>
          <div className="yl-result-count">
            <p>
              {matches.length} {matches.length === 1 ? 'machine' : 'machines'}
              {q ? ` matching “${q}”` : ''}
            </p>
            {(q || category) && <Link href="/products/">Clear filters</Link>}
          </div>
          {shown.length ? (
            <div className="yl-product-grid">
              {shown.map((p) => (
                <EquipmentCard product={p} key={p.id} />
              ))}
            </div>
          ) : (
            <div className="yl-empty">
              <h2>
                {q
                  ? 'No equipment matches this search.'
                  : 'No published equipment in this category yet.'}
              </h2>
              <p>Try a different model or process, or contact Yueli for a recommendation.</p>
              <Link className="yl-button yl-button-outline" href="/products/">
                View Products
              </Link>
            </div>
          )}
          {totalPages > 1 && (
            <nav className="yl-pagination" aria-label="Product pages">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link href={url(i + 1)} key={i} aria-current={page === i + 1 ? 'page' : undefined}>
                  {i + 1}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
    </>
  )
}
export async function ProductView({ slug }: { slug: string }) {
  const [products, { site }, settings] = await Promise.all([
    getProducts(),
    getYueli(),
    getSearchSettings('en'),
  ])
  const product = products.find(
    (p) =>
      p.slug === slug ||
      decodeURIComponent(contentPath(p, 'product').split('/').filter(Boolean).pop() || '') === slug,
  )
  if (!product) notFound()
  const gallery =
    product.general?.gallery?.flatMap((row) =>
      imageURL(row.image) ? [{ src: imageURL(row.image), alt: row.caption || product.title }] : [],
    ) || []
  if (!gallery.length && imageURL(product.general?.heroImage))
    gallery.push({ src: imageURL(product.general?.heroImage), alt: product.title })
  const related = products
    .filter(
      (p) => p.id !== product.id && categoryIDs(p).some((id) => categoryIDs(product).includes(id)),
    )
    .slice(0, 3)
  const category = product.organization?.category
  const formID = typeof site.inquiryForm === 'object' ? site.inquiryForm?.id : site.inquiryForm
  const origin = siteOrigin(settings.siteUrl)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.general?.shortDescription || undefined,
    sku: product.pricing?.sku || undefined,
    image: gallery.map((i) => new URL(i.src, origin).href),
    brand: { '@type': 'Brand', name: site.name },
    url: origin + contentPath(product, 'product'),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <div className="yl-wrap yl-product-breadcrumb">
        <nav className="yl-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products/">Products</Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>
      </div>
      <section className="yl-wrap yl-product-hero">
        <EquipmentGallery images={gallery} />
        <div className="yl-product-description">
          {typeof category === 'object' && category && (
            <Link className="yl-eyebrow" href={contentPath(category, 'category')}>
              {category.title}
            </Link>
          )}
          <h1>{product.title}</h1>
          {product.pricing?.sku && (
            <p className="yl-product-sku">Model / SKU: {product.pricing.sku}</p>
          )}
          <p className="yl-product-summary">{product.general?.shortDescription}</p>
          <dl className="yl-product-service">
            <div>
              <dt>Configuration</dt>
              <dd>Review against your workpiece</dd>
            </div>
            <div>
              <dt>Quotation</dt>
              <dd>Project-specific proposal</dd>
            </div>
          </dl>
          <Link href="#inquiry" className="yl-button">
            Get Quote <span aria-hidden="true">↗</span>
          </Link>
          <p className="yl-small">
            Share the drawing, material, required process and target output.
          </p>
        </div>
      </section>
      <section className="yl-wrap yl-section yl-product-content">
        <nav className="yl-content-nav" aria-label="Product information">
          <a href="#technical-information">Technical Information</a>
          <a href="#inquiry">Project Inquiry</a>
        </nav>
        <div id="technical-information" className="yl-source-content">
          {product.migration?.contentHTML ? (
            <div dangerouslySetInnerHTML={{ __html: safeHTML(product.migration.contentHTML) }} />
          ) : product.general?.description ? (
            <RichText data={product.general.description} enableGutter={false} />
          ) : (
            <p>Contact Yueli for the current specification sheet for this configuration.</p>
          )}
        </div>
      </section>
      <InquiryPanel formID={formID} product={product.title} />
      {!!related.length && (
        <section className="yl-wrap yl-section">
          <h2>Related Equipment</h2>
          <div className="yl-product-grid">
            {related.map((p) => (
              <EquipmentCard product={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
function PostCard({ post }: { post: Post }) {
  return (
    <article className="yl-post-card">
      <Link href={contentPath(post, 'post')} className="yl-post-image">
        {imageURL(post.heroImage) && (
          <Image
            src={imageURL(post.heroImage)}
            alt={post.title}
            fill
            sizes="(max-width:760px) 92vw, 32vw"
          />
        )}
      </Link>
      <time dateTime={post.publishedAt || undefined}>
        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>
      <h2>
        <Link href={contentPath(post, 'post')}>{post.title}</Link>
      </h2>
      <p>{plainText(post.migration?.summary || post.meta?.description || '')}</p>
      <Link className="yl-text-link" href={contentPath(post, 'post')}>
        Read article ↗
      </Link>
    </article>
  )
}
export async function BlogView() {
  const posts = await getPosts()
  return (
    <>
      <PageIntro
        title="Blog & Resources"
        description="Equipment selection guidance, manufacturing updates and practical information for your next project."
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
export async function ArticleView({ path, slug }: { path?: string; slug?: string }) {
  const posts = await getPosts()
  const post = posts.find((p) => (path ? contentPath(p, 'post') === path : p.slug === slug))
  if (!post) notFound()
  const settings = await getSearchSettings('en')
  return (
    <>
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
            publisher: { '@type': 'Organization', name: 'Yueli Automation' },
          }),
        }}
      />
      <article className="yl-wrap yl-article">
        <nav className="yl-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blog/">Blog</Link>
        </nav>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedAt || undefined}>
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {imageURL(post.heroImage) && (
          <Image
            src={imageURL(post.heroImage)}
            alt={post.title}
            width={1300}
            height={700}
            priority
            className="yl-article-cover"
          />
        )}
        <div className="yl-source-content">
          {post.migration?.contentHTML ? (
            <div dangerouslySetInnerHTML={{ __html: safeHTML(post.migration.contentHTML) }} />
          ) : (
            <RichText data={post.content} enableGutter={false} />
          )}
        </div>
        <Link href="/blog/" className="yl-text-link">
          ← All articles
        </Link>
      </article>
    </>
  )
}
export async function SourcePage({ path }: { path: string }) {
  const pages = await getPages()
  const page = pages.find((p) => contentPath(p, 'page') === path)
  if (!page) notFound()
  return (
    <>
      <PageIntro title={page.title} />
      <section className="yl-wrap yl-section">
        <div
          className="yl-source-content yl-information-content"
          dangerouslySetInnerHTML={{ __html: safeHTML(page.migration?.contentHTML) }}
        />
      </section>
    </>
  )
}
export async function ContactView({ product }: { product?: string }) {
  const { site } = await getYueli()
  const formID = typeof site.inquiryForm === 'object' ? site.inquiryForm?.id : site.inquiryForm
  return (
    <>
      <PageIntro
        title="Contact Yueli Automation"
        description="Request equipment information, discuss a custom automation project, or contact our after-sales team."
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
          <dl className="yl-contact-details">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone / WhatsApp</dt>
              <dd>
                <a href={`https://wa.me/${site.telephone.replace(/\D/g, '')}`}>{site.telephone}</a>
              </dd>
            </div>
            <div>
              <dt>Factory Address</dt>
              <dd>{site.address}</dd>
            </div>
          </dl>
          <p className="yl-small">
            For after-sales support, include your machine model and the issue you are experiencing.
          </p>
        </div>
        <div className="yl-contact-form-panel">
          <h2>Project Inquiry</h2>
          <EquipmentInquiryForm formID={formID} product={product} />
        </div>
      </section>
      <section className="yl-wrap yl-section yl-service-terms">
        <h2>
          Key terms to support
          <br />
          early project planning
        </h2>
        <div>
          {[
            ['Lead Time', 'Typically 10–30 days, subject to the confirmed equipment scope.'],
            ['Quotation Validity', 'Quotations are generally valid for 15 days.'],
            ['Payment', 'T/T and L/C are available, subject to the confirmed order.'],
            [
              'Warranty',
              '12 months for the complete machine. Wear parts and consumables are excluded; human-caused damage is handled separately.',
            ],
            [
              'Installation & Training',
              'Overseas installation and training are available. On-site service and travel costs are quoted separately.',
            ],
            [
              'Packing & Support',
              'Export packing and lifetime online technical guidance are provided.',
            ],
          ].map(([title, value]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{value}</p>
            </section>
          ))}
        </div>
      </section>
    </>
  )
}
