import type { ReactNode } from 'react'
import { productDetailSections } from './productDetailSections'
import { safeHTML } from './html'
import { yueliLocalePath } from '@/i18n/yueliPaths'

const navigation = [
  ['yl-overview', 'Overview'],
  ['yl-technical', 'Technical Range'],
  ['yl-features', 'Key Features'],
  ['yl-applications', 'Applications'],
  ['yl-prepare', 'Inquiry Checklist'],
] as const
const checklist = [
  'Workpiece drawing or photo',
  'Material',
  'Key dimensions',
  'Required process and tolerance',
  'Target output',
  'Destination country',
]
const Imported = ({ html, locale }: { html: string; locale: string }) => (
  <div dangerouslySetInnerHTML={{ __html: safeHTML(html, locale) }} />
)

export function ProductDescription({
  html = '',
  summary,
  title,
  fallback,
  category,
  locale = 'en',
}: {
  html?: string
  summary?: string | null
  title: string
  fallback?: ReactNode
  category?: { title: string; href: string }
  locale?: string
}) {
  const content = productDetailSections(html)
  return (
    <div className="yl-source-content" id="technical-information">
      <div className="yueli-detail-v1 yl-detail-layout">
        <div className="yueli-detail-grid">
          <nav className="yueli-detail-nav" aria-label="Product detail sections">
            <strong>Product Overview</strong>
            {navigation.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
          <div className="yueli-detail-main">
            <section id="yl-overview">
              <h2>Product Overview</h2>
              {content.overview ? (
                <Imported html={content.overview} locale={locale} />
              ) : (
                fallback || <p>{summary || title}</p>
              )}
            </section>
            <section id="yl-technical" className="yl-catalog-specs">
              {/class="yl-spec-head"/.test(content.technical) ? null : (
                <div className="yl-spec-head">
                  <span>CATALOG TECHNICAL DATA</span>
                  <h2>Technical Specifications</h2>
                  <p>
                    Technical data from the product documentation. Final configuration is confirmed
                    against the workpiece, process and production requirements.
                  </p>
                </div>
              )}
              {content.technical ? (
                <Imported html={content.technical} locale={locale} />
              ) : (
                <p className="yl-custom-spec">
                  A fixed specification table is not available for this configuration. Send your
                  workpiece requirements to request its technical sheet.
                </p>
              )}
            </section>
            <section id="yl-features">
              <h2>Key Features</h2>
              {content.features ? (
                <Imported html={content.features} locale={locale} />
              ) : (
                <p>{summary || title}</p>
              )}
            </section>
            <section id="yl-applications">
              <h2>Applications</h2>
              {content.applications ? (
                <Imported html={content.applications} locale={locale} />
              ) : (
                <>
                  {category && (
                    <p>
                      <a href={category.href}>{category.title}</a>
                    </p>
                  )}
                  <p>
                    Share your workpiece drawing, material and required operation for an application
                    review. Suitability and configuration are confirmed for the specific part.
                  </p>
                </>
              )}
            </section>
            <section id="yl-prepare">
              <h2>Inquiry Checklist</h2>
              {content.prepare ? (
                <Imported html={content.prepare} locale={locale} />
              ) : (
                <div className="yueli-checklist">
                  <h3>Prepare Your Application Details</h3>
                  <ul className="yl-detail-checklist">
                    {checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <a
                className="yl-detail-inquiry"
                href={yueliLocalePath(`/contact-us?product=${encodeURIComponent(title)}`, locale)}
              >
                Discuss Your Application
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
