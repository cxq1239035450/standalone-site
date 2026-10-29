import { getTranslations as loadInterfaceCopy } from 'next-intl/server'
import type { Metadata } from 'next'
import { CollectionArchive } from '@/components/CollectionArchive'
import { ProductCard } from '@/components/ProductCard'
import config from '@payload-config'
import { getPayload } from '@/i18n/content'
import { Search } from '@/search/Component'
import { isLocale } from '@/i18n/config'
import { notFound } from 'next/navigation'
import { pageMetadata } from '@/utilities/searchSettings'
import { searchPublishedContent } from '@/utilities/searchPublishedContent'

type Args = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[] }> }
export default async function SearchPage({ params, searchParams }: Args) {
  const interfaceCopy = await loadInterfaceCopy('interface')

  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const { q } = await searchParams
  const query = (typeof q === 'string' ? q : '').trim().slice(0, 120)
  const payload = await getPayload({ config })
  const { products, posts } = await searchPublishedContent(payload, locale, query)
  return <main className="pet-site py-16 sm:py-24">
    <div className="pet-container">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#244b3e]">PAWSUPPLY / SEARCH</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{interfaceCopy('app__locale___frontend__search_page_tsx_1')}</h1>
      <div className="my-8 max-w-2xl"><Search query={query} locale={locale} /></div>
      {!query && <p className="text-stone-500">{interfaceCopy('app__locale___frontend__search_page_tsx_2')}</p>}
      {query && products.length === 0 && posts.length === 0 && <p role="status" className="rounded-2xl border border-stone-200 bg-white p-8">{interfaceCopy('app__locale___frontend__search_page_tsx_3')}</p>}
      {products.length > 0 && <section aria-labelledby="product-results"><h2 id="product-results" className="my-8 text-2xl font-semibold">{interfaceCopy('app__locale___frontend__search_page_tsx_4')}</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map(product => <ProductCard key={product.id} product={product} locale={locale} />)}</div></section>}
      {posts.length > 0 && <section aria-labelledby="article-results"><h2 id="article-results" className="my-8 text-2xl font-semibold">{interfaceCopy('app__locale___frontend__search_page_tsx_5')}</h2><CollectionArchive posts={posts} /></section>}
    </div>
  </main>
}
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const interfaceCopy = await loadInterfaceCopy('interface')

  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return pageMetadata({ locale, path: '/search', title: interfaceCopy('app__locale___frontend__search_page_tsx_6'), noIndex: true, languages: false })
}
