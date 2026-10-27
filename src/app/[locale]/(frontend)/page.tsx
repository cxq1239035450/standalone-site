import { YueliHome } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default YueliHome
export async function generateMetadata() {
  return equipmentMetadata('Yueli Automation | Industrial Equipment & Automation Solutions', '/')
}
