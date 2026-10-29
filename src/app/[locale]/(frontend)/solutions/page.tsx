import { ResourceHub } from '@/components/Yueli/ArchitectureViews'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default function Solutions() {
  return <ResourceHub kind="solution" />
}
export async function generateMetadata() {
  return equipmentMetadata(
    'Equipment solutions by production requirement',
    '/solutions',
    'Explore drilling and tapping, valve and faucet production, and custom equipment projects. Connect your process requirements with equipment and buying guidance.',
  )
}
