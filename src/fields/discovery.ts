import type { Field } from 'payload'

export const discoveryFields: Field = {
  name: 'discovery', type: 'group', label: '搜索与 AI 内容优化',
  fields: [
    { name: 'noIndex', type: 'checkbox', defaultValue: false, label: '不索引此内容', admin: { description: '输出 noindex，并从 sitemap 和 llms.txt 中排除。' } },
    { name: 'summary', type: 'textarea', localized: true, label: '简明事实摘要', admin: { description: '回答产品用途、采购适用对象等，会展示在内容页及机器可读摘要中；不要填写无法验证的优势。' } },
  ],
}
