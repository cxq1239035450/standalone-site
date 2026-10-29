'use client'

import { useFormModified, useFormProcessing, useLocale, useTranslation } from '@payloadcms/ui'
import { Languages, LockKeyhole } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useTransition } from 'react'

import { localeConfig } from '@/i18n/config'

import './index.scss'

const baseClass = 'content-language-control'

export default function ContentLanguageControl() {
  const router = useRouter()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const { code: currentLocale } = useLocale()
  const { i18n } = useTranslation()
  const [isSwitching, startTransition] = useTransition()
  const isEnglishAdmin = i18n.language === 'en'
  const activeLocale =
    localeConfig.locales.find(({ code }) => code === currentLocale) ??
    localeConfig.locales.find(({ code }) => code === localeConfig.defaultLocale) ??
    localeConfig.locales[0]
  const switchingDisabled = modified || processing || isSwitching

  const switchLocale = (nextLocale: string) => {
    if (switchingDisabled || nextLocale === currentLocale) return

    // The target is always sourced from localeConfig, never from user input.
    const supportedLocale = localeConfig.locales.some(({ code }) => code === nextLocale)
    if (!supportedLocale) return

    const url = new URL(window.location.href)
    url.searchParams.set('locale', nextLocale)
    startTransition(() => router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false }))
  }

  return (
    <section className={baseClass} data-content-language-control>
      <div className={`${baseClass}__heading`}>
        <span className={`${baseClass}__icon`}>
          <Languages aria-hidden="true" size={20} />
        </span>
        <div>
          <p className={`${baseClass}__eyebrow`}>
            {isEnglishAdmin ? 'Content language' : '内容语言'}
          </p>
          <h2 className={`${baseClass}__title`}>
            {isEnglishAdmin ? 'Currently editing' : '当前正在编辑'}：{activeLocale.label}
          </h2>
        </div>
      </div>

      <div
        aria-label={isEnglishAdmin ? 'Content language' : '内容语言'}
        className={`${baseClass}__options`}
        role="group"
      >
        {localeConfig.locales.map(({ code, label }) => {
          const isActive = code === currentLocale

          return (
            <button
              aria-pressed={isActive}
              className={[`${baseClass}__option`, isActive && `${baseClass}__option--active`]
                .filter(Boolean)
                .join(' ')}
              disabled={isActive || switchingDisabled}
              key={code}
              onClick={() => switchLocale(code)}
              type="button"
            >
              <span>{label}</span>
              <small>{code}</small>
            </button>
          )
        })}
      </div>

      <p className={`${baseClass}__description`}>
        {isEnglishAdmin
          ? 'Saving or publishing applies to the current language. URLs and other shared settings remain unchanged.'
          : '保存或发布只作用于当前语言；URL 和其他共享设置不会随语言切换。'}
      </p>

      {modified && (
        <p className={`${baseClass}__warning`} role="status">
          <LockKeyhole aria-hidden="true" size={15} />
          {isEnglishAdmin
            ? 'You have unsaved changes. Save or publish before switching languages.'
            : '存在未保存修改，请先保存或发布后再切换语言。'}
        </p>
      )}
    </section>
  )
}
