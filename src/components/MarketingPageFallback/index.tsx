import { ArrowRight, BadgeCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export const marketingPageSlugs = ['products', 'solutions', 'about', 'contact'] as const
export type MarketingPageSlug = (typeof marketingPageSlugs)[number]

export function isMarketingPageSlug(value: string): value is MarketingPageSlug {
  return marketingPageSlugs.includes(value as MarketingPageSlug)
}

export async function MarketingPageFallback({ slug }: { slug: MarketingPageSlug }) {
  const t = await getTranslations(`marketingPages.${slug}`)

  return (
    <main className="min-h-[70vh] bg-stone-50 py-24 sm:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white px-7 py-16 shadow-sm sm:px-14 lg:px-20 lg:py-24">
          <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              <BadgeCheck className="h-4 w-4" />
              {t('eyebrow')}
            </div>
            <h1 className="mt-7 text-balance text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {t('description')}
            </p>
            <Link
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-800"
              href={slug === 'contact' ? '/' : '/contact'}
            >
              {t('action')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

