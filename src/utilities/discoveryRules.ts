import type { MetadataRoute } from 'next'
import type { SearchSetting } from '@/payload-types'

export const protectedPaths = ['/admin', '/api/', '/next/']
export const contentSources = ['pages', 'posts', 'products'] as const
export type DiscoverySource = (typeof contentSources)[number]
export type DiscoveryEntry = {
  id?: number
  url: string
  canonical: string
  language: string
  source: DiscoverySource | 'core'
  title: string
  included: boolean
  eligible: boolean
  reason: string
  lastModified?: string
}

export function canonicalURL(automatic: string, override?: string | null): string {
  if (!override) return automatic
  try {
    const url = new URL(override)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.hash && !url.search ? url.href : automatic
  } catch { return automatic }
}
export function contentPath(source: DiscoverySource, slug: string) {
  return source === 'pages' ? (slug === 'home' ? '' : `/${encodeURIComponent(slug)}`) : `/${source}/${encodeURIComponent(slug)}`
}
export function sameCanonical(url: string, canonical: string) {
  return url.replace(/\/$/, '') === canonical.replace(/\/$/, '')
}
export function sitemapData(entries: DiscoveryEntry[]): MetadataRoute.Sitemap {
  return entries.filter(entry => entry.included).map(entry => ({url:entry.url, ...(entry.lastModified ? {lastModified:entry.lastModified} : {})}))
}
export function xmlEscape(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}
export function sitemapText(entries: DiscoveryEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.filter(entry => entry.included).map(entry => `  <url><loc>${xmlEscape(entry.url)}</loc>${entry.lastModified ? `<lastmod>${xmlEscape(new Date(entry.lastModified).toISOString())}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`
}
function lines(value?: string | null) { return (value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean) }
export function robotsData(settings: SearchSetting, origin: string): MetadataRoute.Robots {
  const crawl = settings.allowCrawling !== false
  const rules = [
    {userAgent:'*', ...(crawl ? {allow:['/', '/api/media/file/'], disallow:protectedPaths} : {disallow:'/'})},
    {userAgent:['GPTBot', 'ClaudeBot'], ...(crawl && settings.geo?.allowAITraining ? {allow:['/', '/api/media/file/'], disallow:protectedPaths} : {disallow:'/'})},
    ...(settings.robotsRules || []).map(rule => ({userAgent:rule.userAgent, ...(crawl ? {allow:lines(rule.allow), disallow:[...new Set([...protectedPaths, ...lines(rule.disallow)])]} : {disallow:'/'})})),
  ]
  return {rules, ...(settings.sitemap?.enabled !== false && settings.allowIndexing !== false ? {sitemap:`${origin}/sitemap.xml`} : {})}
}
export function robotsText(settings: SearchSetting, origin: string) {
  const data = robotsData(settings, origin)
  const list = <T,>(value: T | T[] | undefined) => value === undefined ? [] : Array.isArray(value) ? value : [value]
  return list(data.rules).map(rule => [
    ...list(rule.userAgent).map(value => `User-Agent: ${value}`),
    ...list(rule.allow).map(value => `Allow: ${value}`),
    ...list(rule.disallow).map(value => `Disallow: ${value}`),
  ].join('\n')).join('\n\n') + (data.sitemap ? `\n\nSitemap: ${data.sitemap}` : '') + '\n'
}
export function settingsWarnings(settings: SearchSetting) {
  const warnings: string[] = []
  if (settings.allowIndexing === false && settings.allowCrawling === false) warnings.push('已同时禁止索引与抓取。爬虫无法读取页面 noindex；如需移除已有收录，应允许抓取并关闭索引。')
  if (settings.allowCrawling === false && settings.allowIndexing !== false) warnings.push('已禁止抓取，但页面仍允许索引。robots.txt 不保证搜索结果移除。')
  return warnings
}
export function markdownLabel(value: string) {
  return value.replace(/[\r\n]+/g, ' ').replace(/[\[\]\\]/g, match => `\\${match}`)
}
