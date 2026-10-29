import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateSearchSettings } from '@/hooks/revalidateSearch'

const url = (value: string | null | undefined) => {
  if (!value) return true
  try { const parsed = new URL(value); return ['https:', 'http:'].includes(parsed.protocol) || 'Use an HTTP(S) URL' } catch { return 'Use an absolute HTTP(S) URL' }
}

const robotPaths = (value: string | null | undefined) => {
  if (!value) return true
  return value.split(/\r?\n/).every(line => !line.trim() || /^\/[^\s\x00-\x1f]*$/.test(line.trim())) || '每行填写一个以 / 开头的路径，不允许空格或指令。'
}
const robotAllow = (value: string | null | undefined) => {
  const valid = robotPaths(value)
  if (valid !== true || !value) return valid
  return value.split(/\r?\n/).every(line => {
    const path = line.trim()
    return !path || (!/[?*]/.test(path) && !/^\/(admin|api)(?:\/|$)/i.test(path) && !/\/search(?:\/|$)/i.test(path))
  }) || '允许路径不能包含通配符、查询参数，或指向后台、接口、搜索页。'
}
const robotAgent = (value: string | null | undefined) => {
  if (!value || !/^[A-Za-z][A-Za-z0-9_.-]*$/.test(value)) return '请输入有效爬虫名称。'
  return !['gptbot', 'claudebot'].includes(value.toLowerCase()) || '该爬虫请使用 AI 训练抓取开关配置。'
}

export const SearchSettings: GlobalConfig = {
  slug: 'search-settings',
  label: { en: 'SEO & AI discovery', zh: 'SEO 与 AI 搜索配置' },
  access: { read: authenticated, update: authenticated, readVersions: authenticated },
  versions: { drafts: true, max: 25 },
  hooks: { afterChange: [revalidateSearchSettings] },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'PawSupply', required: true, label: '品牌名称 / Site name' },
    { name: 'siteUrl', type: 'text', validate: url, label: '正式站点 URL', admin: { description: '仅支持根域部署，例如 https://example.com，路径与末尾斜杠会忽略。留空使用 NEXT_PUBLIC_SERVER_URL。用于 canonical、站点地图与结构化数据。' } },
    { name: 'description', type: 'textarea', localized: true, label: '默认搜索描述', admin: { description: '页面未填写独立描述时使用，建议 80–160 字符。' } },
    { name: 'socialImage', type: 'upload', relationTo: 'media', label: '默认社交分享图片' },
    { name: 'allowIndexing', type: 'checkbox', defaultValue: true, label: '允许搜索引擎索引', admin: { description: '关闭后输出 noindex，并从 sitemap 和 llms.txt 排除；抓取权限单独配置。' } },
    { name: 'allowCrawling', type: 'checkbox', defaultValue: true, label: '允许搜索引擎抓取', admin: { description: '关闭后 robots.txt 禁止抓取。需要爬虫读取 noindex 时，请保持允许抓取。' } },
    { name: 'sitemap', type: 'group', label: '站点地图', fields: [
      { name: 'enabled', type: 'checkbox', defaultValue: true, label: '启用 sitemap' },
      { name: 'includeCore', type: 'checkbox', defaultValue: true, label: '包含首页、列表和联系页' },
      { name: 'includePages', type: 'checkbox', defaultValue: true, label: '包含页面' },
      { name: 'includeProducts', type: 'checkbox', defaultValue: true, label: '包含商品' },
      { name: 'includePosts', type: 'checkbox', defaultValue: true, label: '包含文章' },
    ] },
    { name: 'robotsRules', type: 'array', label: '其他爬虫规则', admin: { description: '每个爬虫一条规则。通用爬虫和 GPTBot / ClaudeBot 使用上述开关；后台和接口路径始终排除。' }, validate: (rows) => {
      const agents = (rows || []).map(row => String((row as { userAgent?: string }).userAgent || '').toLowerCase())
      return new Set(agents).size === agents.length || '爬虫名称不能重复。'
    }, fields: [
      { name: 'userAgent', type: 'text', required: true, label: '爬虫名称', validate: robotAgent },
      { name: 'allow', type: 'textarea', label: '允许路径（每行一条）', validate: robotAllow },
      { name: 'disallow', type: 'textarea', label: '禁止路径（每行一条）', validate: robotPaths },
    ] },
    { name: 'organization', type: 'group', label: '企业实体信息（仅填写真实资料）', fields: [
      { name: 'legalName', type: 'text', label: '企业法定名称' },
      { name: 'email', type: 'email', label: '公开业务邮箱' },
      { name: 'telephone', type: 'text', label: '公开业务电话' },
      { name: 'sameAs', type: 'array', label: '官方社交 / 企业主页', fields: [{ name: 'url', type: 'text', required: true, validate: url }] },
    ] },
    { name: 'geo', type: 'group', label: 'GEO / 生成式搜索', fields: [
      { name: 'enabled', type: 'checkbox', defaultValue: true, label: '发布 llms.txt 站点说明', admin: { description: '实验性机器可读说明，不保证 AI 引用或收录。只发布已公开信息。' } },
      { name: 'summary', type: 'textarea', localized: true, label: '可引用的企业与服务简介' },
      { name: 'sections', type: 'array', localized: true, label: 'llms.txt 推荐栏目', admin: { description: '按语言编辑，拖动调整顺序。仅输出已启用语言中已发布、允许索引的关联内容。' }, fields: [
        { name: 'title', type: 'text', required: true, label: '栏目名称' },
        { name: 'links', type: 'array', label: '推荐内容', fields: [
          { name: 'label', type: 'text', required: true, label: '链接名称' },
          { name: 'description', type: 'textarea', label: '链接说明' },
          { name: 'content', type: 'relationship', relationTo: ['pages', 'posts', 'products'], required: true, label: '关联内容' },
        ] },
      ] },
      { name: 'faq', type: 'array', localized: true, label: '公开采购 FAQ', admin: { description: '填写后替换首页默认采购问答，并与可见内容同步生成 FAQ 结构化数据。只填写可核实的采购政策。' }, fields: [
        { name: 'question', type: 'text', required: true, label: '问题' },
        { name: 'answer', type: 'textarea', required: true, label: '回答' },
      ] },
      { name: 'allowAITraining', type: 'checkbox', defaultValue: false, label: '允许 GPTBot / ClaudeBot 训练抓取', admin: { description: '输出 robots 爬虫偏好。搜索发现与训练抓取分别控制，第三方是否遵守由其决定。' } },
    ] },
  ],
}
