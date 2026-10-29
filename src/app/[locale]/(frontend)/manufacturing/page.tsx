import { ManufacturingPage } from '@/components/Yueli/ArchitectureViews'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default ManufacturingPage
export async function generateMetadata() {
  return equipmentMetadata(
    'Manufacturing and project verification',
    '/manufacturing',
    'View Yueli factory photographs and published documents. Prepare questions about equipment configuration, inspection, acceptance and project scope.',
  )
}
