'use client'
import React from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

export default function TranslationActions() {
  const { collectionSlug } = useDocumentInfo()
  const subject = useFormFields(([fields]) => fields.subject?.value)
  const source = collectionSlug?.replace(/-translations$/, '')
  if (!source || !subject) return null
  const id = typeof subject === 'object' && subject && 'id' in subject ? subject.id : subject
  const global = ['header', 'footer', 'search-settings'].includes(source)
  return (
    <a
      href={global ? `/admin/globals/${source}` : `/admin/collections/${source}/${id}`}
      style={{ marginRight: 16 }}
    >
      共享资料与其他语言
    </a>
  )
}
