import { EquipmentCatalog, type SearchParams } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
import { getCategories, contentPath } from '@/components/Yueli/data'
export const dynamic = 'force-dynamic'
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string[] }>
  searchParams: Promise<SearchParams>
}) {
  const { category } = await params
  return (
    <EquipmentCatalog
      categorySlug={decodeURIComponent(category.at(-1)!)}
      searchParams={await searchParams}
    />
  )
}
export async function generateMetadata({ params }: { params: Promise<{ category: string[] }> }) {
  const { category } = await params
  const c = (await getCategories()).find((c) => c.slug === decodeURIComponent(category.at(-1)!))
  return equipmentMetadata(
    c?.title || 'Equipment category',
    c ? contentPath(c, 'category') : '/products',
    c?.migration?.summary,
  )
}
