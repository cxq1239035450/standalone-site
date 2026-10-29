import { ResourceHub } from '@/components/Yueli/ArchitectureViews'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default function Resources() {
  return <ResourceHub kind="guide" />
}
export async function generateMetadata() {
  return equipmentMetadata(
    'Equipment buying guides and resources',
    '/resources',
    'Prepare an equipment RFQ, compare machining configurations and plan acceptance and delivery with Yueli’s practical buying guides.',
  )
}
