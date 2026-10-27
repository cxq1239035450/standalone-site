import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateSearchSettings } from '@/hooks/revalidateSearch'

const url = (value: string | null | undefined) => {
  if (!value) return true
  try { const parsed = new URL(value); return ['https:', 'http:'].includes(parsed.protocol) || 'Use an HTTP(S) URL' } catch { return 'Use an absolute HTTP(S) URL' }
}

export const SearchSettings: GlobalConfig = {
  slug: 'search-settings',
  label: { en: 'SEO & AI discovery', zh: 'SEO 与 AI 搜索配置' },
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateSearchSettings] },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Yueli Automation', required: true, label: '品牌名称 / Site name' },
    { name: 'siteUrl', type: 'text', validate: url, label: '正式站点 URL', admin: { description: '仅支持根域部署，例如 https://example.com，路径与末尾斜杠会忽略。留空使用 NEXT_PUBLIC_SERVER_URL。用于 canonical、站点地图与结构化数据。' } },
    { name: 'description', type: 'textarea', localized: true, label: '默认搜索描述', admin: { description: '页面未填写独立描述时使用，建议 80–160 字符。' } },
    { name: 'socialImage', type: 'upload', relationTo: 'media', label: '默认社交分享图片' },
    { name: 'allowIndexing', type: 'checkbox', defaultValue: true, label: '允许搜索引擎索引', admin: { description: '关闭后输出 noindex 与 robots 禁止抓取；不替代访问权限。' } },
    { name: 'organization', type: 'group', label: '企业实体信息（仅填写真实资料）', fields: [
      { name: 'legalName', type: 'text', label: '企业法定名称' },
      { name: 'email', type: 'email', label: '公开业务邮箱' },
      { name: 'telephone', type: 'text', label: '公开业务电话' },
      { name: 'sameAs', type: 'array', label: '官方社交 / 企业主页', fields: [{ name: 'url', type: 'text', required: true, validate: url }] },
    ] },
    { name: 'geo', type: 'group', label: 'GEO / 生成式搜索', fields: [
      { name: 'enabled', type: 'checkbox', defaultValue: true, label: '发布 llms.txt 站点说明', admin: { description: '实验性机器可读说明，不保证 AI 引用或收录。只发布已公开信息。' } },
      { name: 'summary', type: 'textarea', localized: true, label: '可引用的企业与服务简介' },
      { name: 'faq', type: 'array', localized: true, label: '公开采购 FAQ', admin: { description: '填写后替换首页默认采购问答，并与可见内容同步生成 FAQ 结构化数据。只填写可核实的采购政策。' }, fields: [
        { name: 'question', type: 'text', required: true, label: '问题' },
        { name: 'answer', type: 'textarea', required: true, label: '回答' },
      ] },
      { name: 'allowAITraining', type: 'checkbox', defaultValue: false, label: '允许 GPTBot / ClaudeBot 训练抓取', admin: { description: '输出 robots 爬虫偏好。搜索发现与训练抓取分别控制，第三方是否遵守由其决定。' } },
    ] },
  ],
}
