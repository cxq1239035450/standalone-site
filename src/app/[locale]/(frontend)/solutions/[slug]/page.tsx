import { BuyerContentPage } from '@/components/Yueli/ArchitectureViews'
import { getEquipmentContent, resourcePath } from '@/components/Yueli/architecture'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function Solution({ params }: { params: Promise<{ slug: string }> }) {
  return <BuyerContentPage kind="solution" slug={(await params).slug} />
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = (await getEquipmentContent()).find(
    (item) => item.kind === 'solution' && item.slug === slug,
  )
  return equipmentMetadata(
    doc?.title || 'Solution not found',
    doc ? resourcePath(doc) : '/solutions',
    doc?.summary,
    undefined,
    !doc || Boolean(doc.noIndex),
  )
}
