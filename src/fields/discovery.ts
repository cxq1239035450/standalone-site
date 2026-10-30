import type { Field } from 'payload'

export const discoveryFields: Field = {
  name: 'discovery', type: 'group', label: '搜索与 AI 内容优化',
  fields: [
    { name: 'noIndex', type: 'checkbox', defaultValue: false, label: '不索引此内容', admin: { description: '输出 noindex，并从 sitemap 和 llms.txt 中排除。' } },
    { name: 'canonicalUrl', type: 'text', localized: true, label: 'Canonical 地址（留空自动生成）', admin: { description: '填写完整 HTTP(S) 地址可覆盖当前语言的规范地址；不允许查询参数和锚点。' }, validate: (value: string | null | undefined) => {
      if (!value) return true
      try {
        const parsed = new URL(value)
        return (['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password && !parsed.search && !parsed.hash) || '请填写无凭证、查询参数及锚点的 HTTP(S) 地址。'
      } catch { return '请填写完整 HTTP(S) 地址，或留空使用自动生成。' }
    } },
    { name: 'summary', type: 'textarea', localized: true, label: '简明事实摘要', admin: { description: '回答产品用途、采购适用对象等，会展示在内容页及机器可读摘要中；不要填写无法验证的优势。' } },
  ],
}
