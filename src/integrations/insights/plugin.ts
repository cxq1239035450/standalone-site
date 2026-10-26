import { insightsPlugin } from '@site-insights/payload-plugin'
import { localeConfig } from '@/i18n/config'
import { getServerSideURL } from '@/utilities/getURL'

// The adapter owns no fields, tables or save hooks. Remove its registration to detach.
export const siteInsightsPlugin = insightsPlugin({
  enabled: process.env.INSIGHTS_ENABLED === 'true',
  siteId: process.env.INSIGHTS_SITE_ID || 'freshconnect',
  readToken: process.env.INSIGHTS_READ_TOKEN,
  previousReadToken: process.env.INSIGHTS_PREVIOUS_READ_TOKEN,
  collections: ['pages', 'posts', 'products'],
  submissionsCollection: 'form-submissions',
  locales: localeConfig.locales,
  resolveContentUrl: ({ collection, locale, doc }) => {
    const slug = encodeURIComponent(String(doc.slug || ''))
    const path = collection === 'pages'
      ? (doc.slug === 'home' ? `/${locale}` : `/${locale}/${slug}`)
      : `/${locale}/${collection}/${slug}`
    return new URL(path, getServerSideURL()).href
  },
})
