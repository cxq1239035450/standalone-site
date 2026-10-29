import { APIError, type CollectionSlug, type Endpoint } from 'payload'
import {
  isContentSource,
  projectTranslation,
  translatedGlobals,
  translationSlug,
} from './contentSchema'
import { createContentReader } from './content'
import { resolveContentRoute } from './contentRoutes'

export const translationEndpoints: Endpoint[] = [
  {
    path: '/translations/preview-settings',
    method: 'get',
    handler: async (req) => {
      if (!req.user) throw new APIError('请先登录。', 401)
      const params = new URL(req.url!).searchParams
      const language = await req.payload.findByID({
        collection: 'languages',
        id: Number(params.get('language')),
        req,
        overrideAccess: false,
        depth: 0,
      })
      const product = await req.payload.findByID({
        collection: 'products',
        id: Number(params.get('subject')),
        req,
        overrideAccess: false,
        depth: 0,
      })
      const settings = await createContentReader(req.payload).findGlobal({
        slug: 'search-settings',
        locale: language.code,
        user: req.user,
        draft: true,
        depth: 0,
      })
      return Response.json({
        ...settings,
        languageCode: language.code,
        productSlug: product.slug,
        productNoIndex: product.discovery?.noIndex,
      })
    },
  },
  {
    path: '/translations/content',
    method: 'get',
    handler: async (req) => {
      const params = new URL(req.url!).searchParams
      const source = params.get('source') || ''
      const language = params.get('language') || ''
      if (!isContentSource(source) || !language) throw new APIError('请指定内容类型和语言。', 400)
      const enabled = await req.payload.find({
        collection: 'languages',
        overrideAccess: false,
        depth: 0,
        limit: 1,
        where: { code: { equals: language } },
      })
      if (!enabled.docs.length) return Response.json({ error: 'Not found' }, { status: 404 })
      const reader = createContentReader(req.payload)
      if (translatedGlobals.includes(source as (typeof translatedGlobals)[number]))
        return Response.json(
          await reader.findGlobal({ slug: source as 'header', locale: language, depth: 1 }),
        )
      const limit = Math.max(1, Math.min(100, Number(params.get('limit')) || 10))
      const slug = params.get('slug')
      return Response.json(
        await reader.find({
          collection: source as CollectionSlug,
          locale: language,
          limit,
          depth: 1,
          where: slug ? { slug: { equals: slug } } : undefined,
        }),
      )
    },
  },
  {
    path: '/translations/template',
    method: 'get',
    handler: async (req) => {
      if (!req.user) throw new APIError('请先登录。', 401)
      const url = new URL(req.url!)
      const subjectID = Number(url.searchParams.get('product'))
      const languageID = Number(url.searchParams.get('language'))
      const [product, language] = await Promise.all([
        req.payload.findByID({
          collection: 'products',
          id: subjectID,
          depth: 0,
          req,
          overrideAccess: false,
        }),
        req.payload.findByID({
          collection: 'languages',
          id: languageID,
          depth: 0,
          req,
          overrideAccess: false,
        }),
      ])
      const id =
        typeof product.industryTemplate === 'object'
          ? product.industryTemplate?.id
          : product.industryTemplate
      if (!id) return Response.json({ templateID: null })
      const template = await createContentReader(req.payload).findByID({
        collection: 'industry-templates',
        id,
        locale: language.code,
        user: req.user,
        draft: true,
        depth: 0,
        disableErrors: true,
      })
      return Response.json({ templateID: id, template })
    },
  },
  {
    path: '/translations/available',
    method: 'get',
    handler: async (req) => {
      const path = new URL(req.url!).searchParams.get('path') || ''
      const languages = await req.payload.find({
        collection: 'languages',
        depth: 0,
        pagination: false,
        overrideAccess: false,
        where: { enabled: { equals: true } },
      })
      const route = resolveContentRoute(
        path,
        languages.docs.map((language) => language.code),
      )
      if (!route) return Response.json([])
      // The public reader never receives req.user: editor sessions must not make
      // a draft or preparing language appear available to ordinary visitors.
      const reader = createContentReader(req.payload)
      const available = await Promise.all(
        languages.docs.map(async (language) => {
          const result = await reader.find({
            collection: route.collection,
            locale: language.code,
            depth: 0,
            limit: 1,
            draft: false,
            overrideAccess: false,
            where: { and: [route.where, { title: { exists: true } }] },
          })
          return result.docs.some((doc) => doc.title?.trim()) ? language.code : null
        }),
      )
      return Response.json(available.filter(Boolean))
    },
  },
  {
    path: '/translations/manage',
    method: 'get',
    handler: async (req) => {
      if (!req.user) throw new APIError('请先登录。', 401)
      const url = new URL(req.url!)
      const source = url.searchParams.get('source') || ''
      const subject = url.searchParams.get('subject') || ''
      if (!isContentSource(source) || !subject) throw new APIError('无效内容。', 400)
      const [languages, translations, published] = await Promise.all([
        req.payload.find({
          collection: 'languages',
          req,
          overrideAccess: false,
          pagination: false,
          sort: 'sortOrder',
          depth: 0,
        }),
        req.payload.find({
          collection: translationSlug(source) as CollectionSlug,
          req,
          overrideAccess: false,
          pagination: false,
          depth: 0,
          draft: true,
          where: { subject: { equals: subject } },
        }),
        req.payload.find({
          collection: translationSlug(source) as CollectionSlug,
          req,
          overrideAccess: false,
          pagination: false,
          depth: 0,
          draft: false,
          where: { and: [{ subject: { equals: subject } }, { _status: { equals: 'published' } }] },
        }),
      ])
      return Response.json({
        languages: languages.docs,
        translations: translations.docs.map((doc) => ({
          id: doc.id,
          language: (doc as unknown as Record<string, unknown>).language,
          status: (doc as unknown as Record<string, unknown>)._status,
          published: published.docs.some((item) => item.id === doc.id),
        })),
      })
    },
  },
  {
    path: '/translations/manage',
    method: 'post',
    handler: async (req) => {
      if (!req.user) throw new APIError('请先登录。', 401)
      const { source, subject, language, copyFrom } = await req.json!()
      if (!isContentSource(source) || !subject || !language)
        throw new APIError('请指定内容和目标语言。', 400)
      const collection = translationSlug(source) as CollectionSlug
      const global = translatedGlobals.includes(source as (typeof translatedGlobals)[number])
      if (global)
        await req.payload.findGlobal({
          slug: source as 'header',
          req,
          overrideAccess: false,
          depth: 0,
        })
      else
        await req.payload.findByID({
          collection: source as CollectionSlug,
          id: subject,
          req,
          overrideAccess: false,
          depth: 0,
        })
      const existing = await req.payload.find({
        collection,
        req,
        overrideAccess: false,
        depth: 0,
        draft: true,
        limit: 1,
        where: { and: [{ subject: { equals: subject } }, { language: { equals: language } }] },
      })
      if (existing.docs.length) return Response.json({ id: existing.docs[0].id, existing: true })
      let content: Record<string, unknown> = {}
      if (copyFrom) {
        const original = await req.payload.find({
          collection,
          req,
          overrideAccess: false,
          depth: 0,
          draft: false,
          limit: 1,
          where: {
            and: [
              { subject: { equals: subject } },
              { language: { equals: copyFrom } },
              { _status: { equals: 'published' } },
            ],
          },
        })
        if (!original.docs.length) throw new APIError('来源语言尚未发布。', 400)
        const paths = req.payload.collections[collection].config.custom
          ?.translationPaths as string[]
        content = projectTranslation(original.docs[0] as unknown as Record<string, unknown>, paths)
      }
      const created = await req.payload.create({
        collection,
        req,
        overrideAccess: false,
        draft: true,
        data: {
          ...content,
          subject: global ? source : subject,
          language,
          _status: 'draft',
        } as never,
      })
      return Response.json({ id: created.id }, { status: 201 })
    },
  },
]
