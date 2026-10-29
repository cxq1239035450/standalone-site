import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import { getLanguageRegistry } from '@/i18n/service'

export const dynamic = 'force-dynamic'
export async function GET() {
  const settings = await getSearchSettings()
  if (settings.geo?.enabled === false || settings.allowIndexing === false)
    return new Response('Not found', { status: 404 })
  const origin = siteOrigin(settings.siteUrl)
  const { languages } = await getLanguageRegistry()
  const text = [`# ${settings.siteName || 'PawSupply'}`, '', settings.geo?.summary || settings.description || '', '',
    ...languages.flatMap(language => ['', `## ${language.label}`, ...['', '/products', '/posts', '/contact'].map(path => `- [${language.label}${path || '/'}](${origin}/${language.code}${path})`)]), '',
  ].join('\n')
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
