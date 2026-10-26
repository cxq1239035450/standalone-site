import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n/config'

export function Search({ query = '', locale = 'zh' }: { query?: string; locale?: Locale }) {
  const label = locale === 'zh' ? '搜索产品与资讯' : 'Search products and resources'
  return <form action={`/${locale}/search`} method="get" className="flex gap-3">
    <Label htmlFor="search" className="sr-only">{label}</Label>
    <Input id="search" name="q" type="search" defaultValue={query} placeholder={label} maxLength={120} className="bg-white" />
    <Button type="submit">{locale === 'zh' ? '搜索' : 'Search'}</Button>
  </form>
}
