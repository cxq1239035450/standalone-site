import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <main className="pet-site">
      <section className="pet-container py-24 sm:py-32">
        <p className="pet-eyebrow">404</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#5e7169]">{t('description')}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="pet-button" href="/products">{t('products')} <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link className="pet-button pet-button-outline" href="/">{t('home')}</Link>
        </div>
      </section>
    </main>
  )
}
