import { EquipmentCatalog, type SearchParams } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function Products({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <EquipmentCatalog searchParams={await searchParams} />
}
export async function generateMetadata() {
  return equipmentMetadata('Products', '/products')
}
