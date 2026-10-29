import { PostArchive, postArchiveMetadata } from '@/components/Yueli/PostArchive'
import type { CatalogQuery } from '@/components/Yueli/catalogSEO'

export const dynamic = 'force-dynamic'
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<CatalogQuery>
}

export default async function TagArchivePage({ params, searchParams }: Props) {
  return <PostArchive kind="tag" slug={(await params).slug} query={await searchParams} />
}

export async function generateMetadata({ params, searchParams }: Props) {
  return postArchiveMetadata('tag', (await params).slug, await searchParams)
}
