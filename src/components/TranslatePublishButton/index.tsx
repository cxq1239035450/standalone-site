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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { localeConfig } from '@/i18n/config'

import './index.scss'

const pendingKey = 'payload-pending-translation'
const baseClass = 'translate-publish-actions'

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

  const availableTargets = useMemo(
    () => localeConfig.locales.filter(({ code }) => code !== currentLocale),
    [currentLocale],
  )
  const [targetLocale, setTargetLocale] = useState<string>(availableTargets[0]?.code ?? '')
  const target = availableTargets.find(({ code }) => code === targetLocale) ?? availableTargets[0]
  const activeLocale =
    localeConfig.locales.find(({ code }) => code === currentLocale) ??
    localeConfig.locales.find(({ code }) => code === localeConfig.defaultLocale) ??
    localeConfig.locales[0]
  const isEnglishAdmin = i18n.language === 'en'
  const publishLabel = isEnglishAdmin
    ? `Publish ${activeLocale.label}`
    : `发布${activeLocale.label}`
  const canPublish = Boolean(
    hasPublishPermission &&
    (modified || unpublishedVersionCount > 0 || !hasPublishedDoc) &&
    uploadStatus !== 'uploading',
  )

  useEffect(() => {
    setTargetLocale(availableTargets[0]?.code ?? '')
  }, [availableTargets])

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

  if (!target) return <PublishButton label={publishLabel} />

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
    <div className={baseClass}>
      <PublishButton label={publishLabel} />
      {availableTargets.length > 1 && (
        <label className={`${baseClass}__target`}>
          <span>{isEnglishAdmin ? 'Translate next' : '下一翻译语言'}</span>
          <select
            disabled={processing}
            onChange={(event) => setTargetLocale(event.target.value)}
            value={target.code}
          >
            {availableTargets.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <Button
        buttonStyle="secondary"
        disabled={!canPublish || processing}
        id="action-publish-and-translate"
        onClick={publishAndTranslate}
        size="medium"
        type="button"
      >
        {isEnglishAdmin ? 'Publish & translate' : '发布并继续翻译'}
        <span className={`${baseClass}__destination`}>→ {target.label}</span>
      </Button>
    </div>
  )
}
