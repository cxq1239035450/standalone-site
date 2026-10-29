/* eslint-disable @next/next/no-img-element -- Retain the source artwork's exact intrinsic ratios and local files. */
import source from '@/data/yueli.json'
import { getProducts, getYueli, contentPath, imageURL } from './data'
import { EquipmentHero } from './Hero'
import { EquipmentInquiryForm } from './InquiryForm'
import { CertificateRail } from './CertificateRail'
import { IdleProcessVideo } from './IdleProcessVideo'
import './replica.css'

const escaped = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  )
const normalized = (value: string | null | undefined) =>
  (value || '').replace(/\s/g, '').toLowerCase()

/** Source-page layout with live Payload equipment, slide copy, media and inquiry records. */
export async function ReplicaHome() {
  const [{ site }, products] = await Promise.all([getYueli(), getProducts()])
  const home = source.home
  const formID = typeof site.inquiryForm === 'object' ? site.inquiryForm?.id : site.inquiryForm
  const artworks = home.heroSlides.map((artwork, index) => {
    const current = site.slides?.[index]
    const original = source.brand.slides[index]
    let html = artwork.html
    // The collector sanitizes the original layers. CMS replacements are escaped separately.
    if (current && original) {
      if (normalized(current.title) !== normalized(original.title))
        html = html.replace(
          /<(h[12])[^>]*>[\s\S]*?<\/h[12]>/,
          (_, tag) => `<${tag}>${escaped(current.title)}</${tag}>`,
        )
      if (normalized(current.description) !== normalized(original.description))
        html = html.replace(
          /<p(?:\s[^>]*)?>[\s\S]*?<\/p>/,
          `<p>${escaped(current.description || '')}</p>`,
        )
      if (imageURL(current.image))
        html = html.replace(/(<img\s[^>]*?src=")[^"]*"/, `$1${escaped(imageURL(current.image))}"`)
      const href = /^\/(?!\/)/.test(current.href) ? current.href : original.href
      html = html.replace(
        /(<a\s[^>]*?class="yl-hero-btn"[^>]*?href=")[^"]*"([^>]*>)[\s\S]*?<\/a>/,
        `$1${escaped(href)}"$2${escaped(current.label)}</a>`,
      )
    }
    return { ...artwork, html }
  })
  const factory = (site.factoryImages || []).filter(
    (image) => !image.caption?.toLowerCase().includes('campus'),
  )
  const factoryMain = imageURL(factory[0]?.image) || home.factory.mainImage.src
  const certificates = site.certificates?.length
    ? site.certificates.map((entry, index) => ({
        src: imageURL(entry.image),
        alt: entry.caption || `Yueli patent certificate ${index + 1}`,
      }))
    : home.certificates.images
  return (
    <div className="yl-replica-home">
      <div className="ylp">
        <EquipmentHero slides={site.slides} artworks={artworks} />
        <section className="intro">
          <div className="wrap split">
            <IdleProcessVideo src={home.processVideo} poster={home.processPoster} />
            <div>
              <span className="eyebrow">{home.introduction.eyebrow}</span>
              <h2>{home.introduction.title}</h2>
              {home.introduction.paragraphs.map((paragraph, index) => (
                <p key={index}>
                  {index === 0 && site.introduction ? site.introduction : paragraph}
                </p>
              ))}
              <div className="mini">
                {home.introduction.features.map((feature) => (
                  <div key={feature}>{feature}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="products">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{home.featured.eyebrow}</span>
              <h2>{home.featured.title}</h2>
              <p className="lead">{home.featured.description}</p>
            </div>
            <div className="cards">
              {home.featured.products.map((reference) => {
                const product = products.find(
                  (entry) =>
                    (reference.id && entry.migration?.sourceId === reference.id) ||
                    entry.migration?.sourcePath?.toLowerCase() === reference.path.toLowerCase(),
                )
                return (
                  <a
                    className="card"
                    href={product ? contentPath(product, 'product') : reference.path}
                    key={reference.path}
                  >
                    <img
                      src={imageURL(product?.general?.heroImage) || reference.image.src}
                      alt={product?.title || reference.image.alt}
                      width={600}
                      height={600}
                      loading="lazy"
                    />
                    <div className="body">
                      <span className="category">{reference.label}</span>
                      <h3>{product?.title || reference.title}</h3>
                      <p>{reference.summary}</p>
                    </div>
                  </a>
                )
              })}
            </div>
            <div className="products-actions">
              <a className="btn" href="/products/">
                All Products
              </a>
            </div>
          </div>
        </section>
        <section className="process">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{home.process.eyebrow}</span>
              <h2>{home.process.title}</h2>
              <p className="lead">{home.process.description}</p>
            </div>
            <div className="steps">
              {home.process.steps.map((step) => (
                <div className="step" key={step.number}>
                  <b>{step.number}</b>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="yl-factory" aria-labelledby="yl-factory-title">
          <div className="wrap">
            <div className="yl-factory-top">
              <figure className="yl-factory-main">
                <img
                  src={factoryMain}
                  alt={home.factory.mainImage.alt}
                  width={900}
                  height={600}
                  loading="lazy"
                />
              </figure>
              <div className="yl-factory-copy">
                <span className="yl-factory-label">{home.factory.eyebrow}</span>
                <h2 id="yl-factory-title">
                  Built In-House.
                  <br />
                  Ready for Production.
                </h2>
                <p>{home.factory.description}</p>
              </div>
            </div>
            <div className="yl-factory-rail">
              {home.factory.images.map((image, index) => (
                <figure className="yl-factory-card" key={image.src}>
                  <img
                    src={imageURL(factory[index + 1]?.image) || image.src}
                    alt={image.alt}
                    width={900}
                    height={600}
                    loading="lazy"
                  />
                  <figcaption>{image.caption}</figcaption>
                </figure>
              ))}
            </div>
            <div className="yl-factory-link">
              <a href="/about-us/">
                Explore Yueli <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
        <section id="certificates" className="yl-cert-section">
          <div className="yl-cert-shell">
            <div className="yl-cert-head">
              <span className="yl-cert-kicker">{home.certificates.eyebrow}</span>
              <h2>{home.certificates.title}</h2>
              <p>{home.certificates.description}</p>
            </div>
            <CertificateRail certificates={certificates} />
          </div>
        </section>
        <section className="faq">
          <div className="wrap split">
            <div>
              <span className="eyebrow">{home.faq.eyebrow}</span>
              <h2>{home.faq.title}</h2>
              {home.faq.items.map((item, index) => (
                <details open={index === 0} key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
            <img
              src={home.faq.image.src}
              alt={home.faq.image.alt}
              width={600}
              height={600}
              loading="lazy"
            />
          </div>
        </section>
        <section className="cta">
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{home.inquiry.eyebrow}</span>
              <h2>{home.inquiry.title}</h2>
              <p className="lead">{home.inquiry.description}</p>
            </div>
            <EquipmentInquiryForm formID={formID} layout="home" />
            <p className="contactline">
              Email: <a href={`mailto:${site.email}`}>{site.email}</a> &nbsp; · &nbsp; Tel/WhatsApp:{' '}
              <a href={`tel:${site.telephone.replace(/\s/g, '')}`}>{site.telephone}</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
