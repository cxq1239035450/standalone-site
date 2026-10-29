import { llmsText, loadDiscovery } from '@/utilities/discovery'
export const dynamic = 'force-dynamic'
export async function GET() {
  const text = llmsText(await loadDiscovery())
  return text === null ? new Response('Not found', {status:404}) : new Response(text, {headers:{'Content-Type':'text/plain; charset=utf-8'}})
}
