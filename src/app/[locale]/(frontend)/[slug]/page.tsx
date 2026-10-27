import { SourcePage, YueliHome } from '@/components/Yueli/Views'
import { getPages, contentPath } from '@/components/Yueli/data'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return slug === 'home' ? <YueliHome /> : <SourcePage path={`/${slug}`} />
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = (await getPages()).find((p) => contentPath(p, 'page') === `/${slug}`)
  return equipmentMetadata(
    page?.meta?.title || page?.title || 'Page',
    `/${slug}`,
    page?.meta?.description || page?.migration?.summary,
    undefined,
    Boolean(page?.discovery?.noIndex),
  )
}
