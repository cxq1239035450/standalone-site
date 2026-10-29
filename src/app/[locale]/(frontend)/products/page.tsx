import { EquipmentCatalog, type SearchParams } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
import { catalogIndexing } from '@/components/Yueli/catalogSEO'
import { getCategories, contentPath } from '@/components/Yueli/data'
export const dynamic = 'force-dynamic'
export default async function Products({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <EquipmentCatalog searchParams={await searchParams} />
}
export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams
  const slug = query.category || query.product_cat
  const category =
    typeof slug === 'string'
      ? (await getCategories()).find((item) => item.slug === slug)
      : undefined
  const state = catalogIndexing(category ? contentPath(category, 'category') : '/products', query)
  return equipmentMetadata(
    `Products${state.page && state.page > 1 ? ` · Page ${state.page}` : ''}`,
    state.canonical,
    'Browse Yueli drilling, tapping, CNC machining, casting, polishing, assembly and testing equipment. Compare models and prepare your project requirements.',
    undefined,
    state.noIndex,
  )
}
