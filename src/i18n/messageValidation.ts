import zh from '../../messages/zh.json'
import { createTranslator } from 'next-intl'

export const messageTemplate = zh
export function messageLeaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  if (!value || typeof value !== 'object') return {}
  return Object.assign(
    {},
    ...Object.entries(value).map(([key, child]) =>
      messageLeaves(child, prefix ? `${prefix}.${key}` : key),
    ),
  )
}
export function validateMessages(value: unknown): true | string {
  const expected = messageLeaves(messageTemplate)
  const actual = messageLeaves(value)
  if (Object.keys(actual).some((key) => !Object.hasOwn(expected, key)))
    return '包含未知文案键，请使用当前文案模板。'
  for (const [key, source] of Object.entries(expected)) {
    if (!actual[key]?.trim()) return `请填写前台文案：${key}`
    const tokens = (text: string) =>
      [...new Set([...text.matchAll(/\{\s*([a-zA-Z_][\w]*)\s*[,}]/g)].map((match) => match[1]))]
        .sort()
        .join(',')
    if (tokens(source) !== tokens(actual[key]))
      return `文案 ${key} 的插值变量必须保留：${tokens(source)}`
    let malformed = false
    const translate = createTranslator({
      locale: 'en',
      messages: { value: actual[key] },
      onError: () => {
        malformed = true
      },
    })
    translate(
      'value',
      Object.fromEntries(
        tokens(source)
          .split(',')
          .filter(Boolean)
          .map((token) => [token, 1]),
      ),
    )
    if (malformed) return `文案 ${key} 的 ICU 格式无效。`
  }
  return true
}
