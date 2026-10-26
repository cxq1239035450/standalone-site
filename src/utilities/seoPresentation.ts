import { companyProfile } from '@/content/company'

/** Shared by published metadata and the admin preview. */
export function searchTitle(title: string | null | undefined, name = 'PawSupply') {
  const cleaned = title
    ?.split(/[|｜]/)
    .map((part) => part.trim())
    .filter(
      (part) =>
        part && ![name, 'FreshConnect', 'PawSupply', 'Payload Website Template'].includes(part),
    )
    .join(' | ')
  return cleaned ? `${cleaned} | ${name}` : name
}

export function searchDescription(
  description: string | null | undefined,
  fallback: string | null | undefined,
  locale: string,
) {
  return description || fallback || companyProfile[locale === 'en' ? 'en' : 'zh'].description
}

export function productSearchURL(origin: string, locale: string, slug: string) {
  return `${new URL(origin).origin}/${locale === 'en' ? 'en' : 'zh'}/products/${encodeURIComponent(slug)}`
}

export function productGeography(
  meta: { targetMarkets?: string | null; manufacturingOrigin?: string | null } | null | undefined,
  locale: string,
) {
  return [
    {
      name: locale === 'zh' ? '制造产地' : 'Manufacturing origin',
      value: meta?.manufacturingOrigin?.trim(),
    },
    { name: locale === 'zh' ? '目标市场' : 'Target markets', value: meta?.targetMarkets?.trim() },
  ].filter((item): item is { name: string; value: string } => Boolean(item.value))
}
