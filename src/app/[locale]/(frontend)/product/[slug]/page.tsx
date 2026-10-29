import { ProductView } from '@/components/Yueli/Views'
import { equipmentMetadata } from '@/components/Yueli/metadata'
import { getProducts, contentPath, imageURL } from '@/components/Yueli/data'
export const dynamic = 'force-dynamic'
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductView slug={decodeURIComponent((await params).slug)} />
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug)
  const p = (await getProducts()).find(
    (p) =>
      p.slug === slug ||
      decodeURIComponent(contentPath(p, 'product').split('/').filter(Boolean).pop() || '') === slug,
  )
  return p
    ? equipmentMetadata(
        p.meta?.title || p.title || p.slug || 'Yueli equipment',
        contentPath(p, 'product'),
        p.meta?.description || p.general?.shortDescription,
        imageURL(p.general?.heroImage),
      )
    : equipmentMetadata('Equipment not found', '/products', null, undefined, true)
}
