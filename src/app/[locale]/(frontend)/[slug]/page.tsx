import { SourcePage, YueliHome } from '@/components/Yueli/Views'
import { getPages, contentPath } from '@/components/Yueli/data'
import { equipmentMetadata } from '@/components/Yueli/metadata'
import { getLocale } from 'next-intl/server'
import { yueliLocalePath } from '@/i18n/yueliPaths'
export const dynamic = 'force-dynamic'
export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return slug === 'home' ? <YueliHome /> : <SourcePage path={`/${slug}`} />
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const localizedPath = yueliLocalePath(`/${slug}`, await getLocale())
  const page = (await getPages()).find((p) => contentPath(p, 'page') === localizedPath)
  return equipmentMetadata(
    page?.meta?.title || page?.title || 'Page',
    `/${slug}`,
    page?.meta?.description || page?.migration?.summary,
    undefined,
    !page || Boolean(page.discovery?.noIndex),
    page?.discovery?.canonicalUrl,
  )
}
