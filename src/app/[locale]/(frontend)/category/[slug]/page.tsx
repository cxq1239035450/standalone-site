import { PostArchive, postArchiveMetadata } from '@/components/Yueli/PostArchive'
import type { CatalogQuery } from '@/components/Yueli/catalogSEO'

export const dynamic = 'force-dynamic'
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<CatalogQuery>
}

export default async function CategoryArchivePage({ params, searchParams }: Props) {
  return <PostArchive kind="category" slug={(await params).slug} query={await searchParams} />
}

export async function generateMetadata({ params, searchParams }: Props) {
  return postArchiveMetadata('category', (await params).slug, await searchParams)
}
