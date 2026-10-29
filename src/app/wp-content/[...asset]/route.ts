import { yueliLegacyAsset } from '@/utilities/yueliLegacyAssets'

export function GET(request: Request) {
  const destination = yueliLegacyAsset(new URL(request.url).pathname)
  return destination
    ? Response.redirect(new URL(destination, request.url), 308)
    : new Response('Asset not found', { status: 404 })
}

export const HEAD = GET
