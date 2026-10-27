import { ArticleView } from '@/components/Yueli/Views'
import { getPosts, contentPath, imageURL } from '@/components/Yueli/data'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function OriginalArticle({ params }: { params: Promise<{ path: string[] }> }) {
  return <ArticleView path={'/' + (await params).path.join('/')} />
}
export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }) {
  const path = '/' + (await params).path.join('/')
  const post = (await getPosts()).find((p) => contentPath(p, 'post') === path)
  return equipmentMetadata(
    post?.title || 'Article',
    path,
    post?.meta?.description,
    imageURL(post?.heroImage),
  )
}
