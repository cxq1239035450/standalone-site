import { ArticleView } from '@/components/Yueli/Views'
import { getPosts, contentPath, imageURL } from '@/components/Yueli/data'
import { equipmentMetadata } from '@/components/Yueli/metadata'
export const dynamic = 'force-dynamic'
export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticleView slug={(await params).slug} />
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = (await getPosts()).find((p) => p.slug === slug)
  return equipmentMetadata(
    post?.title || 'Article',
    post ? contentPath(post, 'post') : '/blog',
    post?.meta?.description,
    imageURL(post?.heroImage),
    !post || Boolean(post.discovery?.noIndex),
    post?.discovery?.canonicalUrl,
  )
}
