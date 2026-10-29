'use client'

import { useEffect, useState } from 'react'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, Globe2, Loader2 } from 'lucide-react'
import styles from './index.module.css'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import { type Locale } from '@/i18n/config'
import { yueliLocalePath } from '@/i18n/yueliPaths'
import { useSiteLanguages } from '@/i18n/LanguageProvider'

export function LanguageSwitcher({ unprefixedLocale }: { unprefixedLocale?: 'en' } = {}) {
  const currentLocale = useLocale() as Locale
  const pathname = usePathname()
  const t = useTranslations('language')
  const languages = useSiteLanguages()
  const [available, setAvailable] = useState<{ path: string; codes: string[] }>({
    path: '',
    codes: [],
  })
  const detail =
    Boolean(unprefixedLocale) ||
    /^\/[^/]+\/(?:products|posts)\/[^/]+\/?$/.test(pathname) ||
    /^\/[^/]+\/(?!products$|posts$|search$|contact$)[^/]+\/?$/.test(pathname)
  useEffect(() => {
    const controller = new AbortController()
    if (detail)
      fetch(`/api/translations/available?path=${encodeURIComponent(pathname)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : []))
        .then((codes) => setAvailable({ path: pathname, codes }))
        .catch(() => {})
    return () => controller.abort()
  }, [pathname, detail])
  const choices = languages.filter(
    (language) =>
      !detail ||
      language.code === currentLocale ||
      (available.path === pathname && available.codes.includes(language.code)),
  )

  const [pending, setPending] = useState(false)

  function switchLocale(locale: Locale) {
    if (locale === currentLocale || pending) return
    const destination = new URL(window.location.href)
    const segments = destination.pathname.split('/')

    if (unprefixedLocale) {
      destination.pathname = yueliLocalePath(
        destination.pathname,
        locale,
        languages.map((item) => item.code),
      )
    } else if (
      languages.some((language) => language.code === segments[1]) ||
      segments[1] === currentLocale
    ) {
      segments[1] = locale
      destination.pathname = segments.join('/')
    } else {
      segments.splice(1, 0, locale)
      destination.pathname = segments.join('/')
    }
    setPending(true)
    // A language change replaces the entire localized layout. Use a document
    // navigation so cached Next route URLs cannot duplicate the fragment.
    window.location.replace(destination.href)
  }

  if (unprefixedLocale && choices.length < 2) return null
  return (
    <Select.Root
      value={currentLocale}
      onValueChange={(value) => {
        if (choices.some((language) => language.code === value)) switchLocale(value)
      }}
      disabled={pending}
    >
      <Select.Trigger className={styles.trigger} aria-label={t('switch')} aria-busy={pending}>
        {pending ? (
          <Loader2 className={styles.spinner} size={16} aria-hidden="true" />
        ) : (
          <Globe2 className={styles.globe} size={16} aria-hidden="true" />
        )}
        <span className={styles.current}>
          <Select.Value />
        </span>
        <Select.Icon asChild>
          <ChevronDown className={styles.chevron} size={14} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={styles.content}
          position="popper"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <Select.Viewport className={styles.viewport}>
            <Select.Group>
              <Select.Label className={styles.label}>{t('switch')}</Select.Label>
              {choices.map(({ code: locale, label, htmlLang }) => (
                <Select.Item className={styles.item} key={locale} value={locale} textValue={label}>
                  <span className={styles.code} aria-hidden="true">
                    {locale.toUpperCase()}
                  </span>
                  <Select.ItemText>
                    <span lang={htmlLang || locale}>{label}</span>
                  </Select.ItemText>
                  <Select.ItemIndicator className={styles.indicator}>
                    <Check size={16} aria-hidden="true" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
