'use client'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface ProductsFilterClientProps {
  categories: Array<{ id: string; title: string }>
  totalDocs: number
}

export default function ProductsFilterClient({ categories, totalDocs }: ProductsFilterClientProps) {
  const t = useTranslations('products')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentFeatured = searchParams.get('featured') || ''

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
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
    <div className="container mb-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !currentFeatured
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
              onClick={() => {
                const query = createQueryString({ featured: null })
                router.push(query ? `${pathname}?${query}` : pathname)
              }}
            >
              {t('filter.all')}
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                currentFeatured === 'true'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
              onClick={() => {
                const query = createQueryString({
                  featured: currentFeatured === 'true' ? null : 'true',
                })
                router.push(query ? `${pathname}?${query}` : pathname)
              }}
            >
              {t('filter.featured')}
            </button>
          </div>

          {categories.length > 0 && (
            <select
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
              value={currentCategory}
              onChange={(e) => {
                const query = createQueryString({
                  category: e.target.value || null,
                })
                router.push(query ? `${pathname}?${query}` : pathname)
              }}
            >
              <option value="">{t('filter.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="shrink-0 text-sm font-medium text-slate-500">
          {t('filter.showing', { count: totalDocs })}
        </p>
      </div>
    </div>
  )
}
