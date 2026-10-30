'use client'

import React from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import DiscoveryPanel from './index'

const relationID = (value: unknown): string => {
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

export default function CanonicalField() {
  const { collectionSlug } = useDocumentInfo()
  const values = useFormFields(([fields]) => ({ subject: fields.subject?.value, language: fields.language?.value }))
  return <DiscoveryPanel context={{ source: collectionSlug?.replace(/-translations$/, '') || '', subjectID: relationID(values.subject), languageID: relationID(values.language) }}/>
}
