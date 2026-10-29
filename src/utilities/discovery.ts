import { getPayload as getRawPayload, type Payload } from 'payload'
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'
import type { SearchSetting, User } from '@/payload-types'
import { siteOrigin } from './searchSettings'
import {
  canonicalURL, contentPath, contentSources, markdownLabel, sameCanonical,
  type DiscoveryEntry, type DiscoverySource,
} from './discoveryRules'

export type DiscoveryOptions = { payload?: Payload; draft?: boolean; user?: User; lang?: string; audit?: boolean; rulesOnly?: boolean }
export async function loadDiscovery(options: DiscoveryOptions = {}) {
  const raw = options.payload || await getRawPayload({config})
  // No preview-cookie reader here: public machine-readable outputs must never
  // change when an authenticated editor happens to request them.
  const reader = createContentReader(raw)
  const allLanguages = (await raw.find({collection:'languages', where:{enabled:{equals:true}}, pagination:false, depth:0, sort:'sortOrder', overrideAccess:false})).docs
  const languages = allLanguages.filter(language => !options.lang || language.code === options.lang)
  const global = await raw.findGlobal({slug:'language-settings', depth:0, overrideAccess:false})
  const defaultLanguage = allLanguages.find(language => language.id === global.defaultLanguage) || allLanguages[0]
  const readSettings = (locale?: string) => reader.findGlobal({slug:'search-settings', locale, depth:0, draft:Boolean(options.draft && options.user), user:options.user, overrideAccess:false})
  const settings = await readSettings(defaultLanguage?.code)
  const origin = siteOrigin(settings.siteUrl)
  const entries: DiscoveryEntry[] = []
  const localizedSettings = new Map<string, SearchSetting>()
  for (const language of options.rulesOnly || (settings.allowIndexing === false && !options.audit) ? [] : languages) {
    const localized = await readSettings(language.code)
    localizedSettings.set(language.code, localized)
    const add = (input: Omit<DiscoveryEntry, 'included' | 'eligible' | 'reason'>, noIndex = false, additionalReason = '') => {
      const eligible = settings.allowIndexing !== false && !noIndex && sameCanonical(input.url, input.canonical) && !additionalReason
      const selected = input.source === 'core' ? settings.sitemap?.includeCore !== false : settings.sitemap?.[`include${input.source[0].toUpperCase()}${input.source.slice(1)}` as 'includePages' | 'includeProducts' | 'includePosts'] !== false
      const reason = additionalReason || (settings.allowIndexing === false ? '全站禁止索引' : noIndex ? '内容设置 noindex' : !sameCanonical(input.url, input.canonical) ? 'canonical 指向其他地址' : settings.sitemap?.enabled === false ? '站点地图已关闭' : !selected ? '内容类型未纳入站点地图' : '已收录')
      entries.push({...input, eligible, included:eligible && selected && settings.sitemap?.enabled !== false, reason})
    }
    for (const path of ['', '/products', '/posts', '/contact']) {
      const url = `${origin}/${language.code}${path}`
      add({url, canonical:url, language:language.code, source:'core', title:path || '/'})
    }
    for (const source of contentSources) {
      const result = await reader.find({collection:source, locale:language.code, fallbackLocale:false, depth:0, draft:false, pagination:false, overrideAccess:false, where:{_status:{equals:'published'}}})
      for (const doc of result.docs) {
        if (!doc.slug || (source === 'pages' && ['home','products','posts','contact','search'].includes(doc.slug))) continue
        const url = `${origin}/${language.code}${contentPath(source,doc.slug)}`
        add({id:doc.id, url, canonical:canonicalURL(url,doc.discovery?.canonicalUrl), language:language.code, source, title:doc.title || doc.slug, lastModified:doc.updatedAt}, Boolean(doc.discovery?.noIndex), !doc.title?.trim() ? '缺少标题' : '')
      }
      if (source === 'pages') {
        for (const slug of ['about','solutions']) {
          if (!result.docs.some(doc => doc.slug === slug)) {
            const url = `${origin}/${language.code}/${slug}`
            add({url, canonical:url, language:language.code, source:'pages', title:slug})
          }
        }
      }
      if (options.audit && options.user) {
        const shared = await raw.find({collection:source, pagination:false, depth:0, overrideAccess:false, user:options.user})
        const published = new Set(result.docs.map(doc => doc.id))
        for (const doc of shared.docs) {
          if (published.has(doc.id) || !doc.slug || (source === 'pages' && ['home','products','posts','contact','search','about','solutions'].includes(doc.slug))) continue
          const url = `${origin}/${language.code}${contentPath(source,doc.slug)}`
          add({id:doc.id, url, canonical:url, language:language.code, source, title:doc.slug},false,'当前语言没有已发布翻译')
        }
      }
    }
  }
  return {raw,reader,settings,origin,entries,languages,allLanguages,defaultLanguage,localizedSettings}
}

export function llmsText(data: Awaited<ReturnType<typeof loadDiscovery>>) {
  const {settings,languages,localizedSettings,entries} = data
  if (settings.geo?.enabled === false || settings.allowIndexing === false) return null
  const lines = [`# ${markdownLabel(settings.siteName || 'PawSupply')}`, '']
  for (const language of languages) {
    const localized = localizedSettings.get(language.code)!
    lines.push(`## ${markdownLabel(language.label)} (${language.code})`, '', localized.geo?.summary || localized.description || '', '')
    for (const entry of entries.filter(item => item.language === language.code && item.source === 'core' && item.eligible)) {
      lines.push(`- [${markdownLabel(entry.title)}](${entry.url})`)
    }
    for (const section of localized.geo?.sections || []) {
      const links = (section.links || []).flatMap(link => {
        const relation = link.content
        if (!relation) return []
        const id = typeof relation.value === 'object' ? relation.value.id : relation.value
        const entry = entries.find(item => item.language === language.code && item.source === relation.relationTo && item.id === id && item.eligible)
        return entry ? [`- [${markdownLabel(link.label)}](${entry.url})${link.description ? `: ${markdownLabel(link.description)}` : ''}`] : []
      })
      if (links.length) lines.push('', `### ${markdownLabel(section.title)}`, '', ...links)
    }
    lines.push('')
  }
  return lines.join('\n')
}

/** Preview inclusion reflects llms recommendations, independently of sitemap scope. */
export function llmsEntries(data: Awaited<ReturnType<typeof loadDiscovery>>) {
  const selected = new Set<string>()
  for (const language of data.languages) {
    for (const section of data.localizedSettings.get(language.code)?.geo?.sections || []) {
      for (const link of section.links || []) {
        if (!link.content) continue
        const id = typeof link.content.value === 'object' ? link.content.value.id : link.content.value
        selected.add(`${language.code}:${link.content.relationTo}:${id}`)
      }
    }
  }
  return data.entries.map(entry => {
    const enabled = data.settings.geo?.enabled !== false && data.settings.allowIndexing !== false
    const requested = entry.source === 'core' || selected.has(`${entry.language}:${entry.source}:${entry.id}`)
    return {...entry, included:enabled && requested && entry.eligible, reason:!enabled ? 'llms.txt 已关闭' : !entry.eligible ? entry.reason : !requested ? '未列入 AI 推荐内容' : '已收录'}
  })
}

export async function canonicalDetails(data: Awaited<ReturnType<typeof loadDiscovery>>, options: {lang?:string; path?:string; source?:DiscoverySource; id?:number; draft?:boolean; user?:User}) {
  const locale = options.lang || data.defaultLanguage?.code
  if (!locale) throw new Error('请选择内容语言。')
  let preparing = false
  if (!data.allLanguages.some(language => language.code === locale)) {
    if (!options.user) throw new Error('请选择已启用的内容语言。')
    const found = await data.raw.find({collection:'languages',where:{code:{equals:locale}},limit:1,depth:0,user:options.user,overrideAccess:false})
    if (!found.docs.length) throw new Error('内容语言不存在。')
    preparing = true
  }
  let path = options.path || ''
  let doc: Awaited<ReturnType<typeof data.reader.findByID<'pages'>>> | null = null
  let source = options.source
  let fixedRoute = false
  if (source && options.id) {
    doc = await data.reader.findByID({collection:source,id:options.id,locale,draft:Boolean(options.draft && options.user),user:options.user,depth:0,disableErrors:true})
    if (!doc?.slug) throw new Error('该内容在当前语言中没有可预览的版本。')
    path = contentPath(source,doc.slug)
    // These application routes render their own metadata. The corresponding
    // legacy CMS document cannot override their canonical or indexing policy.
    if (source === 'pages' && ['home','products','posts','contact','search'].includes(doc.slug)) {
      fixedRoute = true
      doc = null
      source = undefined
    }
  } else {
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) path = path.slice(locale.length + 1)
    if (path === '/') path = ''
    if (path && (!path.startsWith('/') || path.startsWith('//') || /[?#\r\n]/.test(path))) throw new Error('请输入站内路径，不包含域名、查询参数或锚点。')
    const match = /^\/(products|posts)\/([^/]+)$/.exec(path)
    source = match ? match[1] as DiscoverySource : !['','/products','/posts','/contact','/search'].includes(path) && /^\/[^/]+$/.test(path) ? 'pages' : undefined
    if (source) {
      const slug = decodeURIComponent(match ? match[2] : path.slice(1))
      const result = await data.reader.find({collection:source,locale,depth:0,limit:1,draft:Boolean(options.draft&&options.user),user:options.user,where:{slug:{equals:slug}}})
      doc = result.docs[0] || null
      if (!doc && !(source === 'pages' && ['about','solutions'].includes(slug))) throw new Error('该路径没有可预览的内容。')
    } else if (!['','/products','/posts','/contact','/search'].includes(path)) throw new Error('该路径没有可预览的内容。')
  }
  const url = `${data.origin}/${locale}${path}`
  const canonical = canonicalURL(url,doc?.discovery?.canonicalUrl)
  const alternates: Record<string,string> = {}
  const isTarget = (entry:DiscoveryEntry, language:string) => source && doc
    ? entry.source === source && (entry.id === doc.id || (source === 'pages' && !entry.id && ['about','solutions'].includes(doc.slug || '') && entry.url === `${data.origin}/${language}${path}`))
    : entry.url === `${data.origin}/${language}${path}`
  for (const language of data.allLanguages) {
    const entry = data.entries.find(item => item.language === language.code && isTarget(item,language.code))
    if (entry?.eligible) alternates[language.htmlLang || language.code] = entry.url
  }
  const defaultEntry = data.entries.find(item => item.language === data.defaultLanguage?.code && isTarget(item,data.defaultLanguage?.code || ''))
  if (defaultEntry?.eligible) alternates['x-default'] = defaultEntry.url
  const noIndex = data.settings.allowIndexing === false || Boolean(doc?.discovery?.noIndex) || path === '/search'
  return {url,canonical,alternates,noIndex,preparing,fixedRoute}
}
