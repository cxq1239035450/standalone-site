import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { EquipmentContent } from '@/payload-types'
import { getEquipmentContent, relationIDs, resourcePath } from './architecture'
import { getCategories, getPosts, getProducts, getYueli, contentPath, imageURL } from './data'
import { Breadcrumbs } from './Breadcrumbs'
import { EquipmentCard } from './EquipmentCard'
import { getSearchSettings, jsonLd, siteOrigin } from '@/utilities/searchSettings'

export function ResourceLinks({
  items,
  heading = 'Plan the next step',
}: {
  items: EquipmentContent[]
  heading?: string
}) {
  if (!items.length) return null
  return (
    <section className="yl-related-reading">
      <h2>{heading}</h2>
      <div className="yl-resource-list">
        {items.map((item) => (
          <article key={item.id}>
            <p className="yl-eyebrow">
              {item.kind === 'solution' ? 'Application solution' : 'Buying guide'}
            </p>
            <h3>
              <a href={resourcePath(item)}>{item.title}</a>
            </h3>
            <p>{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export async function BuyerPaths() {
  const resources = await getEquipmentContent()
  const solutions = resources.filter((item) => item.kind === 'solution')
  if (!solutions.length) return null
  return (
    <section className="yl-wrap yl-section yl-buyer-paths">
      <div className="yl-section-heading">
        <div>
          <p className="yl-eyebrow">Choose your starting point</p>
          <h2>
            Start with the process
            <br />
            you need to improve.
          </h2>
        </div>
        <a className="yl-text-link" href="/solutions">
          Explore application solutions ↗
        </a>
      </div>
      <div className="yl-buyer-rows">
        {solutions.map((item, index) => (
          <article key={item.id}>
            <span className="yl-path-number">0{index + 1}</span>
            <h3>
              <a href={resourcePath(item)}>{item.title}</a>
            </h3>
            <p>{item.summary}</p>
            <a href={resourcePath(item)} aria-label={`Explore ${item.title}`}>
              Explore route ↗
            </a>
          </article>
        ))}
      </div>
      <div className="yl-path-footer">
        <p>Already know the equipment you need?</p>
        <a href="/products">Browse the product catalog</a>
        <a href="/resources/prepare-equipment-rfq">Prepare an equipment RFQ</a>
      </div>
    </section>
  )
}

export async function HomeBuyingGuides() {
  const guides = (await getEquipmentContent()).filter((item) => item.kind === 'guide')
  if (!guides.length) return null
  return (
    <div className="yl-wrap yl-section">
      <ResourceLinks items={guides} heading="Prepare for the equipment discussion" />
      <section className="yl-home-questions">
        <h2>Before you send an inquiry</h2>
        <div className="yl-buyer-faq">
          {guides.map(
            (guide) =>
              guide.questions?.[0] && (
                <details key={guide.id}>
                  <summary>{guide.questions[0].question}</summary>
                  <p>
                    {guide.questions[0].answer}{' '}
                    <a href={resourcePath(guide)}>Read the full guide ↗</a>
                  </p>
                </details>
              ),
          )}
        </div>
        <a href="/faq">More questions about working with Yueli ↗</a>
      </section>
    </div>
  )
}

export async function ResourceHub({ kind }: { kind: EquipmentContent['kind'] }) {
  const [resources, posts] = await Promise.all([getEquipmentContent(), getPosts()])
  const items = resources.filter((item) => item.kind === kind)
  const isSolution = kind === 'solution'
  const title = isSolution
    ? 'Equipment solutions by production requirement'
    : 'Resources for equipment buyers'
  return (
    <>
      <section className="yl-page-intro">
        <div className="yl-wrap">
          <Breadcrumbs
            items={[
              {
                name: isSolution ? 'Solutions' : 'Resources',
                href: isSolution ? '/solutions' : '/resources',
              },
            ]}
          />
          <p className="yl-eyebrow">
            {isSolution ? 'From workpiece to proposal' : 'Before you request a quote'}
          </p>
          <h1>{title}</h1>
          <p>
            {isSolution
              ? 'Find a starting route for your process, then review the relevant equipment and the information needed for a proposal.'
              : 'Prepare a useful equipment brief, compare configurations and agree how the project will be checked.'}
          </p>
        </div>
      </section>
      <div className="yl-wrap yl-section">
        <ResourceLinks
          items={items}
          heading={isSolution ? 'Explore a process route' : 'Buying guides'}
        />
        {!items.length && (
          <p className="yl-empty">
            Guides are being prepared.{' '}
            <a href="/contact-us">Discuss your requirement with Yueli.</a>
          </p>
        )}
        <div className="yl-proof-links">
          <h2>
            {isSolution ? 'Check the manufacturing context' : 'Questions about working with Yueli?'}
          </h2>
          <p>
            {isSolution
              ? 'Review the factory photographs and discuss the configuration, inspection and handover records required for your project.'
              : 'Use the FAQ for general questions, or describe your project for a scope review.'}
          </p>
          <a href="/manufacturing">Manufacturing and verification</a>
          <a href="/faq">Frequently asked questions</a>
          <a href="/contact-us">Request a project review</a>
        </div>
        {!isSolution && (
          <section className="yl-related-reading">
            <h2>Articles and company updates</h2>
            <p>Browse published articles alongside the practical buying guides above.</p>
            <ul className="yl-article-links">
              {posts.slice(0, 4).map((post) => (
                <li key={post.id}>
                  <a href={contentPath(post, 'post')}>{post.title}</a>
                </li>
              ))}
            </ul>
            <a href="/blog">View all articles ↗</a>
          </section>
        )}
      </div>
    </>
  )
}

export async function BuyerContentPage({
  kind,
  slug,
}: {
  kind: EquipmentContent['kind']
  slug: string
}) {
  const [resources, products, categories, settings] = await Promise.all([
    getEquipmentContent(),
    getProducts(),
    getCategories(),
    getSearchSettings('en'),
  ])
  const item = resources.find((doc) => doc.kind === kind && doc.slug === slug)
  if (!item) notFound()
  const origin = siteOrigin(settings.siteUrl),
    path = resourcePath(item)
  const relatedProducts = products.filter((product) =>
    relationIDs(item.relatedProducts).includes(product.id),
  )
  const relatedCategories = categories.filter((category) =>
    relationIDs(item.relatedCategories).includes(category.id),
  )
  const related = resources.filter((doc) => relationIDs(item.relatedContent).includes(doc.id))
  const organization = { '@id': `${origin}/#organization` }
  const schema = {
    '@context': 'https://schema.org',
    '@type': kind === 'guide' ? 'Article' : 'WebPage',
    '@id': `${origin}${path}#content`,
    url: origin + path,
    ...(kind === 'guide'
      ? {
          headline: item.title,
          datePublished: item.createdAt,
          dateModified: item.updatedAt,
          publisher: organization,
        }
      : { name: item.title, isPartOf: { '@id': `${origin}/#website` } }),
    description: item.summary,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className="yl-page-intro">
        <div className="yl-wrap">
          <Breadcrumbs
            items={[
              {
                name: kind === 'solution' ? 'Solutions' : 'Resources',
                href: kind === 'solution' ? '/solutions' : '/resources',
              },
              { name: item.title, href: path },
            ]}
          />
          <p className="yl-eyebrow">
            {kind === 'solution' ? 'Application solution' : 'Yueli Automation · Buying guide'}
          </p>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
          <a
            className="yl-button"
            href={`/contact-us?project=${encodeURIComponent(item.title)}`}
          >
            Request a project review ↗
          </a>
        </div>
      </section>
      <div className="yl-wrap yl-section yl-guide-layout">
        <aside className="yl-guide-contents">
          <h2>On this page</h2>
          <nav aria-label="Page contents">
            {item.sections.map((section, index) => (
              <a key={section.id || index} href={`#section-${index + 1}`}>
                {section.heading}
              </a>
            ))}
            {Boolean(item.questions?.length) && <a href="#buyer-questions">Buyer questions</a>}
            {relatedProducts.length > 0 && <a href="#related-equipment">Related equipment</a>}
          </nav>
          <a href="/manufacturing">View the manufacturing context ↗</a>
        </aside>
        <article className="yl-guide-body">
          {item.sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.id || index}>
              <h2>{section.heading}</h2>
              {section.body.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </section>
          ))}
          {Boolean(item.questions?.length) && (
            <section id="buyer-questions">
              <h2>Buyer questions</h2>
              <div className="yl-buyer-faq">
                {item.questions?.map((question) => (
                  <details key={question.id || question.question}>
                    <summary>{question.question}</summary>
                    <p>{question.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
          <div className="yl-guide-note">
            Planning guidance: confirm the equipment configuration, acceptance method and commercial
            terms for your actual project.
          </div>
        </article>
      </div>
      {relatedProducts.length > 0 && (
        <section className="yl-wrap yl-section" id="related-equipment">
          <h2>Equipment to discuss</h2>
          <div className="yl-product-grid">
            {relatedProducts.map((product) => (
              <EquipmentCard product={product} key={product.id} />
            ))}
          </div>
        </section>
      )}
      <section className="yl-wrap yl-section">
        {relatedCategories.length > 0 && (
          <nav className="yl-category-strip" aria-label="Related equipment categories">
            {relatedCategories.map((category) => (
              <a key={category.id} href={contentPath(category, 'category')}>
                {category.title} ↗
              </a>
            ))}
          </nav>
        )}
        <ResourceLinks items={related} />
      </section>
      <section className="yl-inquiry-section">
        <div className="yl-wrap yl-section yl-section-heading">
          <div>
            <h2>Make the next discussion specific.</h2>
            <p>Share the workpiece, required operations and the result you need.</p>
          </div>
          <a
            className="yl-button"
            href={`/contact-us?project=${encodeURIComponent(item.title)}`}
          >
            Request a project review ↗
          </a>
        </div>
      </section>
    </>
  )
}

export async function ManufacturingPage() {
  const { site } = await getYueli()
  return (
    <>
      <section className="yl-page-intro">
        <div className="yl-wrap">
          <Breadcrumbs items={[{ name: 'Manufacturing', href: '/manufacturing' }]} />
          <p className="yl-eyebrow">Quanzhou, Fujian, China</p>
          <h1>Manufacturing and project verification</h1>
          <p>
            See Yueli’s published factory photographs and prepare the questions that turn an
            equipment discussion into a defined project.
          </p>
          <a
            href="/contact-us?project=Factory%20and%20project%20verification"
            className="yl-button"
          >
            Discuss your project ↗
          </a>
        </div>
      </section>
      <section className="yl-wrap yl-section">
        <h2>Inside Yueli</h2>
        <div className="yl-factory-grid">
          {site.factoryImages?.map((item) => (
            <figure key={item.id}>
              {imageURL(item.image) && (
                <Image
                  src={imageURL(item.image)}
                  alt={item.caption || 'Yueli factory'}
                  width={1100}
                  height={700}
                />
              )}
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
        <a className="yl-text-link" href="/about-us">
          Read the company introduction ↗
        </a>
      </section>
      <section className="yl-wrap yl-section">
        <h2>What to confirm before an order</h2>
        <div className="yl-check-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Project question</th>
                <th scope="col">Information to agree</th>
                <th scope="col">Prepare for the discussion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Can the equipment process this part?</th>
                <td>Configuration, tools, fixture and operation sequence</td>
                <td>
                  <a href="/resources/machine-selection-checklist">
                    Equipment comparison checklist
                  </a>
                </td>
              </tr>
              <tr>
                <th scope="row">How will the result be checked?</th>
                <td>Sample, measurement method, operating conditions and records</td>
                <td>
                  <a href="/resources/acceptance-and-delivery">
                    Acceptance and delivery guide
                  </a>
                </td>
              </tr>
              <tr>
                <th scope="row">What is included in the proposal?</th>
                <td>Equipment scope, accessories, installation, training and delivery terms</td>
                <td>
                  <a href="/resources/prepare-equipment-rfq">Equipment RFQ checklist</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="yl-wrap yl-section">
        <h2>Published certificates and documents</h2>
        <p>
          These images are reproduced from Yueli’s website. Ask the team to confirm the document
          holder, scope and applicability to the equipment in your proposal.
        </p>
        <div className="yl-certificates">
          {site.certificates?.map((cert) => (
            <a
              href={imageURL(cert.image)}
              key={cert.id}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${cert.caption || 'document'}`}
            >
              <Image
                src={imageURL(cert.image)}
                alt={cert.caption || 'Published Yueli document'}
                width={210}
                height={280}
              />
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
