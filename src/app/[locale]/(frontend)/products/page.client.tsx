'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Loader2, Search } from 'lucide-react'
import styles from '@/components/ProductGallery/products.module.css'

interface ProductsFilterClientProps {
  categories: Array<{ id: string; title: string }>
  totalDocs: number
  activeCategory: string
}

export default function ProductsFilterClient({
  categories,
  totalDocs,
  activeCategory,
}: ProductsFilterClientProps) {
  const t = useTranslations('products')
  const zh = useLocale() === 'zh'
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = activeCategory
  const [pending, startTransition] = useTransition()
  const navigate = (url: string) => startTransition(() => router.push(url, { scroll: false }))
  const currentFeatured = searchParams.get('featured') || ''

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      return params.toString()
    },
    [searchParams],
  )

  return (
    <div className="pet-container mb-8" aria-busy={pending}>
      <form
        className={styles.searchForm}
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          const query = createQueryString({
            q: String(form.get('q') || '').trim(),
            sort: String(form.get('sort') || ''),
          })
          navigate(query ? `${pathname}?${query}` : pathname)
        }}
      >
        <div className={styles.searchField}>
          <Search size={19} aria-hidden="true" />
          <input
            key={searchParams.get('q') || ''}
            name="q"
            type="search"
            maxLength={150}
            defaultValue={searchParams.get('q') || ''}
            placeholder={zh ? '搜索产品名称、材质或 SKU' : 'Search products, materials or SKU'}
            aria-label={zh ? '搜索产品' : 'Search products'}
          />
        </div>
        <select
          key={searchParams.get('sort') || ''}
          name="sort"
          defaultValue={searchParams.get('sort') === 'title' ? 'title' : ''}
          aria-label={zh ? '产品排序' : 'Sort products'}
        >
          <option value="">{zh ? '最新发布' : 'Newest first'}</option>
          <option value="title">{zh ? '按产品名称' : 'Product name'}</option>
        </select>
        <button type="submit" className="pet-button" disabled={pending}>
          {zh ? '查找产品' : 'Find products'}
        </button>
      </form>
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              disabled={pending}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                currentFeatured !== 'true'
                  ? 'bg-[#173f35] text-white'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
              aria-pressed={currentFeatured !== 'true'}
              onClick={() => {
                const query = createQueryString({ featured: null })
                navigate(query ? `${pathname}?${query}` : pathname)
              }}
            >
              {t('filter.all')}
            </button>
            <button
              disabled={pending}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                currentFeatured === 'true'
                  ? 'bg-[#173f35] text-white'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
              aria-pressed={currentFeatured === 'true'}
              onClick={() => {
                const query = createQueryString({
                  featured: currentFeatured === 'true' ? null : 'true',
                })
                navigate(query ? `${pathname}?${query}` : pathname)
              }}
            >
              {t('filter.featured')}
            </button>
          </div>

          {categories.length > 0 && (
            <select
              disabled={pending}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
              aria-label={t('filter.allCategories')}
              value={currentCategory}
              onChange={(e) => {
                const query = createQueryString({
                  category: e.target.value || null,
                })
                navigate(query ? `${pathname}?${query}` : pathname)
              }}
            >
              <option value="">{t('filter.allCategories')}</option>
              {currentCategory && !categories.some((cat) => cat.id === currentCategory) && (
                <option value={currentCategory}>{t('filter.unknownCategory')}</option>
              )}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          )}
          {(currentCategory ||
            currentFeatured === 'true' ||
            searchParams.get('q') ||
            searchParams.get('sort')) && (
            <button
              disabled={pending}
              className="text-sm underline underline-offset-4"
              onClick={() => navigate(pathname)}
            >
              {t('filter.reset')}
            </button>
          )}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-500"
        >
          {pending && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {pending
            ? t('filter.loading')
            : totalDocs > 0
              ? t('filter.showing', { count: totalDocs })
              : t('filter.consult')}
        </p>
      </div>
    </div>
  )
}
