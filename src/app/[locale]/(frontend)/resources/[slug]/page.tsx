import { BuyerContentPage } from '@/components/Yueli/ArchitectureViews'
import { getEquipmentContent, resourcePath } from '@/components/Yueli/architecture'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function Guide({ params }: { params: Promise<{ slug: string }> }) {
  return <BuyerContentPage kind="guide" slug={(await params).slug} />
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = (await getEquipmentContent()).find(
    (item) => item.kind === 'guide' && item.slug === slug,
  )
  return equipmentMetadata(
    doc?.title || 'Guide not found',
    doc ? resourcePath(doc) : '/resources',
    doc?.summary,
    undefined,
    !doc || Boolean(doc.noIndex),
  )
}
