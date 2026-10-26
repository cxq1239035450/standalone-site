import { getTranslations } from 'next-intl/server'
import { Loader2 } from 'lucide-react'

export default async function ProductsLoading() {
  const t = await getTranslations('products')
  return (
    <main className="pet-site min-h-[60vh] py-20">
      <div className="pet-container" role="status" aria-live="polite">
        <p className="flex items-center gap-3 text-lg">
          <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {t('filter.loading')}
        </p>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-square rounded-xl bg-[#dde5da] animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
