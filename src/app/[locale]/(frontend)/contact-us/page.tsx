import { ContactView, type SearchParams } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const query = await searchParams
  return (
    <ContactView
      product={typeof query.product === 'string' ? query.product.slice(0, 300) : undefined}
      project={typeof query.project === 'string' ? query.project.slice(0, 300) : undefined}
    />
  )
}
export async function generateMetadata() {
  return equipmentMetadata('Contact Yueli Automation', '/contact-us')
}
