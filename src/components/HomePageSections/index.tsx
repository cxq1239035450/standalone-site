import { ArrowRight, ArrowUpRight, ClipboardCheck, PackageCheck, Palette, Plus } from 'lucide-react'
import Image from 'next/image'
import { getTranslations, getLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProductCard } from '@/components/ProductCard'
import { Link } from '@/i18n/navigation'
import { defaultLocale, isLocale } from '@/i18n/config'
import { getSearchSettings, jsonLd } from '@/utilities/searchSettings'
import styles from './index.module.css'
import { FactoryNetwork } from '@/components/FactoryNetwork'
import { ShippingOptions } from '@/components/ShippingOptions'

const categories = ['bedding', 'feeding', 'toys', 'walking'] as const

export async function HomePageSections() {
  const value = await getLocale()
  const locale = isLocale(value) ? value : defaultLocale
  const t = await getTranslations('home')
  const payload = await getPayload({ config: configPromise })
  const { docs: featuredProducts } = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    fallbackLocale: false,
    limit: 4,
    locale,
    pagination: false,
    overrideAccess: false,
    where: {
      'organization.category.slug': { in: ['bedding', 'feeding', 'toys', 'walking'] },
      _status: { equals: 'published' },
      'organization.featured': { equals: true },
      title: { exists: true },
    },
  })
  const steps = t.raw('custom.steps') as Array<{ title: string; description: string }>
  const briefItems = t.raw('brief.items') as Array<{ title: string; description: string }>
  const guides = t.raw('guides.items') as Array<{
    title: string
    description: string
    action: string
  }>
  const settings = await getSearchSettings(locale)
  const configuredQuestions = settings.geo?.faq?.filter((item) => item.question && item.answer)
  const questions = configuredQuestions?.length
    ? configuredQuestions
    : (t.raw('faq.items') as Array<{ question: string; answer: string }>)
  return (
    <main className="pet-site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: questions.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }),
        }}
      />
      <section className="pet-container pet-hero">
        <div className="pet-hero-copy">
          <span className={styles.eyebrow}>{t('hero.eyebrow')}</span>
          <h1>
            {t('hero.title')}
            <span>{t('hero.highlight')}</span>
          </h1>
          <p>{t('hero.description')}</p>
          <div className="pet-hero-actions">
            <Link className="pet-button" href="/products">
              {t('hero.primaryAction')} <ArrowRight size={20} />
            </Link>
            <Link className="pet-button pet-button-outline" href="/contact">
              {t('hero.secondaryAction')}
            </Link>
          </div>
          <ul className={styles.heroNotes}>
            {[PackageCheck, Palette, ClipboardCheck].map((Icon, index) => (
              <li key={index}>
                <Icon size={16} aria-hidden="true" />
                {t(`hero.notes.${index}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="pet-hero-media">
          <Image
            src="/pet-assets/hero-pets.webp"
            alt={t('hero.imageAlt')}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
      </section>
      <div className="pet-container">
        <div className="pet-audience">
          {(t.raw('audience') as string[]).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
      <section className={`pet-container pet-section ${styles.collection}`} id="collection">
        <div className="pet-section-heading">
          <div>
            <h2>{t('categories.title')}</h2>
            <p>{t('categories.description')}</p>
          </div>
          <Link className="pet-text-link" href="/products">
            {t('categories.viewAll')} <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((key) => (
            <Link key={key} href={`/products?category=${key}`} className={styles.category}>
              <div className={styles.categoryImage}>
                <Image src={`/pet-assets/${key}.webp`} alt="" fill sizes="80px" />
              </div>
              <div>
                <h3>{t(`categories.${key}.name`)}</h3>
                <p>{t(`categories.${key}.description`)}</p>
              </div>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
      {featuredProducts.length > 0 && (
        <section className={`pet-container pet-section ${styles.featured}`}>
          <div className="pet-section-heading">
            <div>
              <h2>{t('products.title')}</h2>
              <p>{t('products.description')}</p>
            </div>
            <Link href="/products" className="pet-text-link">
              {t('products.viewAll')} <ArrowRight size={20} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </section>
      )}
      <FactoryNetwork />
      <section className="pet-custom" id="customization">
        <div className="pet-container pet-custom-inner">
          <div className="pet-custom-intro">
            <h2>{t('custom.title')}</h2>
            <p>{t('custom.description')}</p>
            <Link className="pet-text-link" href="/solutions">
              {t('custom.action')} <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="pet-steps">
            {steps.map((step, i) => (
              <article key={step.title}>
                <span>0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={`pet-container pet-section ${styles.guides}`}>
        <div className="pet-section-heading">
          <div>
            <h2>{t('guides.title')}</h2>
            <p>{t('guides.description')}</p>
          </div>
        </div>
        <div className={styles.guideGrid}>
          {guides.map((guide, index) => (
            <article className={styles.guide} key={guide.title}>
              <span className={styles.guideNumber}>0{index + 1}</span>
              <div>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
                <Link
                  href={`/solutions#${index === 0 ? 'samples' : 'quality'}`}
                  className="pet-text-link"
                >
                  {guide.action} <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <aside className={styles.brief} aria-labelledby="procurement-brief-title">
          <div className={styles.briefIntro}>
            <ClipboardCheck size={24} aria-hidden="true" />
            <h3 id="procurement-brief-title">{t('brief.title')}</h3>
            <p>{t('brief.description')}</p>
          </div>
          <ol>
            {briefItems.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ol>
          <Link className="pet-text-link" href="/contact">
            {t('brief.action')} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </aside>
      </section>
      <ShippingOptions />
      <section className="pet-container pet-section pet-faq" id="faq">
        <div>
          <h2>{t('faq.title')}</h2>
          <p>{t('faq.description')}</p>
          <Link className="pet-text-link" href="/contact">
            {t('faq.action')} <ArrowUpRight size={18} />
          </Link>
        </div>
        <div>
          {questions.map((item, i) => (
            <details key={item.question} open={i === 0}>
              <summary>
                {item.question}
                <Plus size={19} />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="pet-cta">
        <div className="pet-container">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.description')}</p>
          <Link className="pet-button" href="/contact">
            {t('cta.action')} <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  )
}
