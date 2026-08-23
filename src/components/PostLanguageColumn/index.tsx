import type { DefaultServerCellComponentProps } from 'payload'

import React from 'react'

import { localeConfig } from '@/i18n/config'

type LocalizedStatus = Record<string, 'draft' | 'published' | null | undefined>

export async function PostLanguageCell({ i18n, payload, rowData }: DefaultServerCellComponentProps) {
  const post = await payload.findByID({
    collection: 'posts',
    id: rowData.id,
    depth: 0,
    locale: 'all',
    select: {
      _status: true,
    },
  })
  const statuses = post._status as unknown as LocalizedStatus
  const publishedLocales = localeConfig.locales.filter(
    ({ code }) => statuses?.[code] === 'published',
  )
  const isEnglishAdmin = i18n.language === 'en'

  if (publishedLocales.length === 0) {
    return (
      <span style={{ color: 'var(--theme-elevation-500)', fontSize: 12 }}>
        {isEnglishAdmin ? 'Not published' : '未发布'}
      </span>
    )
  }

  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {publishedLocales.map(({ code, label }) => (
        <span
          key={code}
          style={{
            background: 'var(--theme-success-100)',
            border: '1px solid var(--theme-success-300)',
            borderRadius: 999,
            color: 'var(--theme-success-700)',
            display: 'inline-flex',
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1,
            padding: '6px 9px',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      ))}
    </span>
  )
}

// List-only virtual field. Publication languages are derived from Payload's
// localized status and are never entered manually in the edit form.
export function PostLanguageField() {
  return null
}
