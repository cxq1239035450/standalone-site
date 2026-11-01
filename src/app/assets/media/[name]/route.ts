import { serveAsset } from '@/cache/serveAsset'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ name: string }> }
export async function GET(request: Request, context: Context) {
  return serveAsset(request, (await context.params).name)
}
export const HEAD = GET
