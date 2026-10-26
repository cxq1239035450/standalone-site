import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { SourcingGuide } from '@/components/SourcingGuide'
import { FactoryNetwork } from '@/components/FactoryNetwork'
import { ShippingOptions } from '@/components/ShippingOptions'
export const marketingPageSlugs = ['products', 'solutions', 'about', 'contact'] as const
export type MarketingPageSlug = (typeof marketingPageSlugs)[number]
export function isMarketingPageSlug(value: string): value is MarketingPageSlug {
  return marketingPageSlugs.includes(value as MarketingPageSlug)
}
export async function MarketingPageFallback({ slug }: { slug: MarketingPageSlug }) {
  if (slug === 'solutions') return <SourcingGuide />
  const t = await getTranslations(`marketingPages.${slug}`)
  const home = await getTranslations('home')
  const steps = home.raw('custom.steps') as Array<{ title: string; description: string }>
  return (
    <main className="pet-site">
      <section className="pet-container pet-hero pet-marketing-hero">
        <div className="pet-hero-copy">
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
          <Link className="pet-button" href="/contact">
            {t('action')} <ArrowRight size={20} />
          </Link>
        </div>
        <div className="pet-hero-media">
          <Image
            src="/pet-assets/hero-pets.webp"
            fill
            sizes="(max-width:767px) 100vw, 50vw"
            alt={home('hero.imageAlt')}
          />
        </div>
      </section>
      {slug === 'about' && <FactoryNetwork />}
      <section className="pet-custom">
        <div className="pet-container">
          <h2>{home('custom.title')}</h2>
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
      {slug === 'about' && <ShippingOptions />}
    </main>
  )
}
