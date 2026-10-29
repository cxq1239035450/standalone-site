import { useTranslations as useInterfaceCopy } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n/config'

export function Search({ query = '', locale = 'zh' }: { query?: string; locale?: Locale }) {
  const interfaceCopy = useInterfaceCopy('interface')

  const label = interfaceCopy('search_Component_tsx_1')
  return <form action={`/${locale}/search`} method="get" className="flex gap-3">
    <Label htmlFor="search" className="sr-only">{label}</Label>
    <Input id="search" name="q" type="search" defaultValue={query} placeholder={label} maxLength={120} className="bg-white" />
    <Button type="submit">{interfaceCopy('search_Component_tsx_2')}</Button>
  </form>
}
