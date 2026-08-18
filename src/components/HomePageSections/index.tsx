import {
  ArrowRight,
  BadgeCheck,
  Beef,
  Building2,
  Clock3,
  Fish,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Snowflake,
  Sprout,
  Truck,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

const categories = [
  { key: 'vegetables', icon: Leaf, accent: 'bg-emerald-100 text-emerald-700' },
  { key: 'fruits', icon: Sprout, accent: 'bg-amber-100 text-amber-700' },
  { key: 'meat', icon: Beef, accent: 'bg-rose-100 text-rose-700' },
  { key: 'seafood', icon: Fish, accent: 'bg-sky-100 text-sky-700' },
] as const

const advantages = [
  { key: 'source', icon: BadgeCheck },
  { key: 'quality', icon: ShieldCheck },
  { key: 'coldChain', icon: Snowflake },
  { key: 'delivery', icon: Truck },
] as const

const steps = [
  { key: 'verify', icon: Building2 },
  { key: 'select', icon: Leaf },
  { key: 'confirm', icon: PackageCheck },
  { key: 'deliver', icon: Truck },
] as const

export async function HomePageSections() {
  const t = await getTranslations('home')

  return (
    <main className="overflow-hidden bg-stone-50 text-slate-900">
      <section className="relative isolate border-b border-emerald-950/10 bg-emerald-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.22),transparent_34%),linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_100%)]" />
        <div className="container grid min-h-[650px] items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-white/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur">
              <BadgeCheck className="h-4 w-4" />
              {t('hero.eyebrow')}
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              {t('hero.title')}
              <span className="mt-2 block text-emerald-300">{t('hero.highlight')}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-50/75 sm:text-xl">
              {t('hero.description')}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 font-semibold text-emerald-950 transition hover:bg-emerald-300" href="/search">
                {t('hero.primaryAction')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10" href="/contact">
                {t('hero.secondaryAction')}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-stone-50 p-6 text-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">{t('dashboard.label')}</p>
                    <p className="mt-1 text-2xl font-semibold">{t('dashboard.title')}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{t('dashboard.status')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(({ key, icon: Icon, accent }) => (
                    <div className="rounded-2xl border border-stone-200 bg-white p-4" key={key}>
                      <span className={`mb-5 inline-flex rounded-xl p-2.5 ${accent}`}><Icon className="h-5 w-5" /></span>
                      <p className="font-semibold">{t(`categories.${key}.name`)}</p>
                      <p className="mt-1 text-xs text-slate-500">{t(`categories.${key}.count`)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl">
              <span className="rounded-xl bg-amber-100 p-2 text-amber-700"><Clock3 className="h-5 w-5" /></span>
              <div><p className="text-xs text-slate-500">{t('dashboard.deliveryLabel')}</p><p className="font-semibold">{t('dashboard.deliveryValue')}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="container grid grid-cols-2 divide-x divide-stone-200 py-10 lg:grid-cols-4">
          {(['suppliers', 'products', 'customers', 'cities'] as const).map((key) => (
            <div className="px-5 py-3 text-center" key={key}>
              <p className="text-3xl font-semibold tracking-tight text-emerald-800 sm:text-4xl">{t(`stats.${key}.value`)}</p>
              <p className="mt-2 text-sm text-slate-500">{t(`stats.${key}.label`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-24 sm:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{t('categories.eyebrow')}</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t('categories.title')}</h2></div>
          <p className="max-w-xl text-lg leading-8 text-slate-600">{t('categories.description')}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ key, icon: Icon, accent }) => (
            <article className="group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" key={key}>
              <span className={`inline-flex rounded-2xl p-3 ${accent}`}><Icon className="h-7 w-7" /></span>
              <h3 className="mt-8 text-xl font-semibold">{t(`categories.${key}.name`)}</h3>
              <p className="mt-3 min-h-12 leading-6 text-slate-500">{t(`categories.${key}.description`)}</p>
              <p className="mt-6 text-sm font-semibold text-emerald-700">{t(`categories.${key}.count`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28">
        <div className="container">
          <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{t('advantages.eyebrow')}</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t('advantages.title')}</h2></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-stone-200 bg-stone-200 md:grid-cols-2 lg:grid-cols-4">
            {advantages.map(({ key, icon: Icon }) => (
              <article className="bg-white p-7" key={key}><Icon className="h-7 w-7 text-emerald-700" /><h3 className="mt-8 text-xl font-semibold">{t(`advantages.${key}.title`)}</h3><p className="mt-3 leading-7 text-slate-500">{t(`advantages.${key}.description`)}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-24 sm:py-28">
        <div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{t('process.eyebrow')}</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t('process.title')}</h2></div>
        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map(({ key, icon: Icon }, index) => (
            <article className="relative text-center" key={key}><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-lg"><Icon className="h-7 w-7" /></span><span className="mt-5 block text-xs font-bold tracking-widest text-emerald-700">0{index + 1}</span><h3 className="mt-2 text-lg font-semibold">{t(`process.${key}.title`)}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{t(`process.${key}.description`)}</p></article>
          ))}
        </div>
      </section>

      <section className="container pb-24 sm:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-900 px-7 py-14 text-white sm:px-14 lg:flex lg:items-center lg:justify-between lg:py-16">
          <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative max-w-2xl"><h2 className="text-3xl font-semibold sm:text-4xl">{t('cta.title')}</h2><p className="mt-4 text-lg leading-8 text-emerald-100/75">{t('cta.description')}</p></div>
          <Link className="relative mt-8 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-emerald-950 transition hover:bg-emerald-100 lg:mt-0" href="/contact">{t('cta.action')} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  )
}
