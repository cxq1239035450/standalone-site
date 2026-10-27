import { BlogView } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default BlogView
export async function generateMetadata() {
  return equipmentMetadata('Blog & Resources', '/blog')
}
