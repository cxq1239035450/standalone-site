import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { adminLabel } from '@/i18n/adminLabels'
import { contentLanguageField } from '@/fields/contentLanguageField'
import { siteInsightsPlugin } from '@/integrations/insights/plugin'
import { validateFormSubmission } from '@/hooks/validateFormSubmission'

const generateTitle: GenerateTitle<Post | Page> = async ({ doc, req }) => {
  const settings = await req.payload.findGlobal({
    slug: 'search-settings',
    req,
    overrideAccess: false,
  })
  return doc?.title
    ? `${doc.title} | ${settings.siteName || 'Yueli Automation'}`
    : settings.siteName || 'Yueli Automation'
}

const generateURL: GenerateURL<Post | Page> = async ({ doc, req, collectionSlug }) => {
  const settings = await req.payload.findGlobal({
    slug: 'search-settings',
    req,
    overrideAccess: false,
  })
  const origin = new URL(settings.siteUrl || getServerSideURL()).origin
  const prefix =
    collectionSlug === 'products' ? '/product' : collectionSlug === 'posts' ? '/blog' : ''
  const path =
    doc?.migration?.sourcePath ||
    (doc?.slug && doc.slug !== 'home' ? `${prefix}/${encodeURIComponent(doc.slug)}` : '/')
  return `${origin}${path}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      labels: {
        singular: adminLabel('重定向', 'Redirect'),
        plural: adminLabel('重定向', 'Redirects'),
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: adminLabel(
                  '修改此字段后需要重新构建网站。',
                  'You will need to rebuild the website when changing this field.',
                ),
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      labels: {
        singular: adminLabel('表单', 'Form'),
        plural: adminLabel('表单', 'Forms'),
      },
      fields: ({ defaultFields }) => {
        const fields = defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })

        return [contentLanguageField(), ...fields]
      },
    },
    formSubmissionOverrides: {
      hooks: { beforeValidate: [validateFormSubmission] },
      labels: {
        singular: adminLabel('表单提交', 'Form submission'),
        plural: adminLabel('表单提交', 'Form submissions'),
      },
      access: {
        // B2B inquiry: anyone can submit, only authenticated users can read
        create: () => true,
        read: ({ req: { user } }) => Boolean(user),
        update: () => false,
        delete: ({ req: { user } }) => Boolean(user),
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      // Public search reads live published collections, not these internal sync records.
      access: { read: ({ req }) => Boolean(req.user) },
      labels: {
        singular: adminLabel('搜索索引', 'Search result'),
        plural: adminLabel('搜索索引', 'Search results'),
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  siteInsightsPlugin,
]
