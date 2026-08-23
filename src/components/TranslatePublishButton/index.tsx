'use client'

import {
  Button,
  PublishButton,
  toast,
  useDocumentInfo,
  useForm,
  useFormModified,
  useFormProcessing,
  useLocale,
  useServerFunctions,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { localeConfig } from '@/i18n/config'

const pendingKey = 'payload-pending-translation'

type PendingTranslation = {
  collectionSlug?: string
  fromLocale: string
  toLocale: string
}

export default function TranslatePublishButton() {
  const {
    collectionSlug,
    globalSlug,
    hasPublishedDoc,
    hasPublishPermission,
    id,
    unpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo()
  const { isValid } = useForm()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const { code: currentLocale } = useLocale()
  const { copyDataFromLocale } = useServerFunctions()
  const { i18n } = useTranslation()
  const router = useRouter()
  const copyingRef = useRef(false)
  const armedRef = useRef(false)
  const previousProcessingRef = useRef(processing)

  const target = useMemo(
    () => localeConfig.locales.find(({ code }) => code !== currentLocale),
    [currentLocale],
  )
  const isEnglishAdmin = i18n.language === 'en'
  const canPublish = Boolean(
    hasPublishPermission &&
      (modified || unpublishedVersionCount > 0 || !hasPublishedDoc) &&
      uploadStatus !== 'uploading',
  )

  const copyAndContinue = useCallback(
    async (pending: PendingTranslation) => {
      if (!id || copyingRef.current) return

      copyingRef.current = true
      try {
        await copyDataFromLocale({
          collectionSlug,
          docID: id,
          fromLocale: pending.fromLocale,
          globalSlug,
          // Preserve an existing translation. Only empty target-language fields
          // receive the published source content as a translation draft.
          overrideData: false,
          toLocale: pending.toLocale,
        })

        sessionStorage.removeItem(pendingKey)
        const url = new URL(window.location.href)
        url.searchParams.set('locale', pending.toLocale)
        router.push(`${url.pathname}${url.search}`)
        router.refresh()
      } catch (error) {
        sessionStorage.removeItem(pendingKey)
        toast.error(error instanceof Error ? error.message : i18n.t('error:unknown'))
      } finally {
        armedRef.current = false
        copyingRef.current = false
      }
    },
    [collectionSlug, copyDataFromLocale, globalSlug, id, i18n, router],
  )

  // A newly-created document only receives its ID after publishing. Keep the
  // selected action through the redirect, then continue once the edit view mounts.
  useEffect(() => {
    if (!id) return

    const raw = sessionStorage.getItem(pendingKey)
    if (!raw) return

    try {
      const pending = JSON.parse(raw) as PendingTranslation
      if (
        pending.collectionSlug === collectionSlug &&
        pending.fromLocale === currentLocale &&
        pending.toLocale
      ) {
        void copyAndContinue(pending)
      }
    } catch {
      sessionStorage.removeItem(pendingKey)
    }
  }, [collectionSlug, copyAndContinue, currentLocale, id])

  // Existing documents stay on the same route after publishing, so continue
  // when Payload's normal publish submission finishes successfully.
  useEffect(() => {
    const justFinished = previousProcessingRef.current && !processing
    previousProcessingRef.current = processing

    if (!justFinished || !armedRef.current) return
    if (!isValid) {
      armedRef.current = false
      sessionStorage.removeItem(pendingKey)
      return
    }

    const raw = sessionStorage.getItem(pendingKey)
    if (raw) void copyAndContinue(JSON.parse(raw) as PendingTranslation)
  }, [copyAndContinue, isValid, processing])

  if (!target) return <PublishButton />

  const publishAndTranslate = () => {
    const pending: PendingTranslation = {
      collectionSlug,
      fromLocale: currentLocale,
      toLocale: target.code,
    }
    armedRef.current = true
    sessionStorage.setItem(pendingKey, JSON.stringify(pending))
    document.getElementById('action-save')?.click()
  }

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      <PublishButton />
      <Button
        buttonStyle="secondary"
        disabled={!canPublish || processing}
        id="action-publish-and-translate"
        onClick={publishAndTranslate}
        size="medium"
        type="button"
      >
        {isEnglishAdmin ? 'Publish & translate' : '发布并继续翻译'}
        <span style={{ marginInlineStart: 6, opacity: 0.65 }}>→ {target.label}</span>
      </Button>
    </div>
  )
}
