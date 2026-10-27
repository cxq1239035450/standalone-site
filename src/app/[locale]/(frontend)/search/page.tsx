import { EquipmentCatalog, type SearchParams } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function EquipmentSearch({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  return <EquipmentCatalog searchParams={await searchParams} />
}
export async function generateMetadata() {
  return equipmentMetadata('Search equipment', '/search', null, undefined, true)
}
