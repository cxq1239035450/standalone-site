import { insightsPlugin } from '@site-insights/payload-plugin'
import { localeConfig } from '@/i18n/config'
import { getServerSideURL } from '@/utilities/getURL'
import type { Plugin } from 'payload'
import { withSubmissionFields } from './submissions'

// The adapter owns no fields, tables or save hooks. Remove its registration to detach.
const baseInsightsPlugin = insightsPlugin({
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

/** 保留原插件的鉴权与分页，在私有投影中附加动态询盘字段。 */
export const siteInsightsPlugin: Plugin = async config => withSubmissionFields(await baseInsightsPlugin(config))
