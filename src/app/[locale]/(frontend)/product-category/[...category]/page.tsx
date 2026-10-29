import { EquipmentCatalog, type SearchParams } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
import { getCategories, contentPath } from '@/components/Yueli/data'
import { getProducts, categoryIDs, categoryBranch } from '@/components/Yueli/data'
import { catalogIndexing } from '@/components/Yueli/catalogSEO'
import { permanentRedirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string[] }>
  searchParams: Promise<SearchParams>
}) {
  const { category } = await params
  const found = (await getCategories()).find((c) => c.slug === decodeURIComponent(category.at(-1)!))
  if (
    found &&
    decodeURI(contentPath(found, 'category')) !==
      '/product-category/' + category.map(decodeURIComponent).join('/')
  ) {
    const query = await searchParams
    const suffix = new URLSearchParams(
      Object.entries(query).flatMap(([key, value]) =>
        typeof value === 'string' ? [[key, value]] : [],
      ),
    ).toString()
    permanentRedirect(contentPath(found, 'category') + (suffix ? `?${suffix}` : ''))
  }
  return (
    <EquipmentCatalog
      categorySlug={decodeURIComponent(category.at(-1)!)}
      searchParams={await searchParams}
    />
  )
}
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string[] }>
  searchParams: Promise<SearchParams>
}) {
  const { category } = await params
  const categories = await getCategories()
  const c = categories.find((c) => c.slug === decodeURIComponent(category.at(-1)!))
  const products = await getProducts()
  const hasProducts = Boolean(
    c &&
    products.some((p) => categoryIDs(p).some((id) => categoryBranch(c.id, categories).has(id))),
  )
  const state = catalogIndexing(
    c ? contentPath(c, 'category') : '/products',
    await searchParams,
    hasProducts,
  )
  return equipmentMetadata(
    `${c?.title || 'Equipment category'}${state.page && state.page > 1 ? ` · Page ${state.page}` : ''}`,
    state.canonical,
    c?.buyerGuide?.summary ||
      `Explore ${c?.title || 'equipment'} from the Yueli catalog. Review the workpiece, process and configuration before requesting a quotation.`,
    undefined,
    state.noIndex,
  )
}
