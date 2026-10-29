import { ArticleView } from '@/components/Yueli/Views'
import { getPosts, contentPath, imageURL } from '@/components/Yueli/data'
import { equipmentMetadata } from '@/components/Yueli/metadata'
import { getLocale } from 'next-intl/server'
import { yueliLocalePath } from '@/i18n/yueliPaths'
export const dynamic = 'force-dynamic'
export default async function OriginalArticle({ params }: { params: Promise<{ path: string[] }> }) {
  return <ArticleView path={'/' + (await params).path.join('/')} />
}
export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const path = '/' + (await params).path.join('/')
  const localizedPath = yueliLocalePath(path, await getLocale())
  const post = (await getPosts()).find((p) => contentPath(p, 'post') === localizedPath)
  return equipmentMetadata(
    post?.title || 'Article',
    path,
    post?.meta?.description,
    imageURL(post?.heroImage),
    !post,
  )
}
