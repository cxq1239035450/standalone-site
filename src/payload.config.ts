import { InquiryMailSettings } from './globals/InquiryMailSettings'
import { InquiryMailDeliveries } from './collections/InquiryMailDeliveries'
import { sendInquiryMailTask } from './email/service'
import { inquiryMailEndpoints } from './endpoints/inquiryMail'
import { SearchSettings } from './globals/SearchSettings'
import { IndustryTemplates } from './collections/IndustryTemplates'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { defaultLocale, localeConfig } from './i18n/config'
import { dynamicContentPlugin } from './i18n/contentPlugin'
import { recordViewsPlugin } from './plugins/recordViews'
import { translationEndpoints } from './i18n/endpoints'
import { seoEndpoints } from './i18n/seoEndpoints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const adminZh = {
  ...zh,
  translations: {
    ...zh.translations,
    version: {
      ...zh.translations.version,
      publishIn: '发布{{locale}}',
    },
  },
}
const adminEn = {
  ...en,
  translations: {
    ...en.translations,
    version: {
      ...en.translations.version,
      publishIn: 'Publish {{locale}}',
    },
  },
}

export default buildConfig({
  // Admin UI language (menus, buttons, validation messages, etc.).
  // This is separate from `localization`, which controls localized content fields.
  i18n: {
    fallbackLanguage: defaultLocale,
    supportedLanguages: {
      zh: adminZh,
      en: adminEn,
    },
  },
  localization: {
    locales: localeConfig.locales.map(({ code, label }) => ({ code, label })),
    defaultLocale,
    defaultLocalePublishOption: 'active',
    fallback: true,
  },
  experimental: {
    localizeStatus: true,
  },
  admin: {
    components: {
      // Keep the dashboard on Payload's translated core UI. The template's demo
      // welcome components contain hard-coded English copy.
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [Pages, Posts, Media, Categories, Users, Products, IndustryTemplates, InquiryMailDeliveries],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SearchSettings, InquiryMailSettings],
  plugins: [...plugins, dynamicContentPlugin, recordViewsPlugin],
  endpoints: [...translationEndpoints, ...seoEndpoints, ...inquiryMailEndpoints],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    autoRun: [{ cron: '* * * * *', queue: 'inquiry-mail', limit: 10 }],
    shouldAutoRun: () => process.env.INQUIRY_EMAIL_AUTORUN === 'true' && process.env.NODE_ENV !== 'test' && !process.env.VERCEL,
    tasks: [sendInquiryMailTask],
  },
})
