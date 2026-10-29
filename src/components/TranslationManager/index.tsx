'use client'
import React, { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

type Language = { id: number; code: string; label: string; enabled: boolean }
type Translation = { id: number; language: number; status: string; published: boolean }
export default function TranslationManager() {
  const router = useRouter()
  const { id, collectionSlug, globalSlug } = useDocumentInfo()
  const source = globalSlug || collectionSlug
  const subject = globalSlug || id
  const [data, setData] = useState<{ languages: Language[]; translations: Translation[] }>()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copyFrom, setCopyFrom] = useState('')
  useEffect(() => {
    if (!subject || !source) return
    const controller = new AbortController()
    fetch(
      `/api/translations/manage?source=${encodeURIComponent(source)}&subject=${encodeURIComponent(subject)}`,
      { signal: controller.signal },
    )
      .then(async (res) => {
        if (!res.ok) throw new Error('无法读取翻译状态')
        return res.json()
      })
      .then(setData)
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message)
      })
    return () => controller.abort()
  }, [source, subject])
  async function create(language: number) {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/translations/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          subject,
          language,
          copyFrom: copyFrom ? Number(copyFrom) : undefined,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.errors?.[0]?.message || '创建失败')
      router.push(`/admin/collections/${source}-translations/${result.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建失败')
      setBusy(false)
    }
  }
  return (
    <section
      style={{ padding: '20px', border: '1px solid var(--theme-elevation-150)', marginBottom: 24 }}
    >
      <h3>内容翻译</h3>
      <p>共享数据只维护一份。每种语言单独保存、预览和发布；复制仅创建草稿。</p>
      {!subject ? (
        <p>请先保存共享资料，再添加翻译。</p>
      ) : (
        <>
          <label>
            创建方式{' '}
            <select
              value={copyFrom}
              onChange={(event) => setCopyFrom(event.target.value)}
              disabled={busy}
            >
              <option value="">空白翻译</option>
              {data?.languages.map((language) => (
                <option key={language.id} value={language.id}>
                  复制 {language.label} 已发布内容
                </option>
              ))}
            </select>
          </label>
          <ul>
            {data?.languages.map((language) => {
              const translation = data.translations.find((row) => row.language === language.id)
              return (
                <li key={language.id} style={{ marginBlock: 12 }}>
                  {language.label} ({language.code}) · {language.enabled ? '已启用' : '准备中'} ·{' '}
                  {translation
                    ? translation.published
                      ? translation.status === 'published'
                        ? '已发布'
                        : '已发布（有新草稿）'
                      : '草稿，未发布'
                    : '未翻译'}{' '}
                  {translation ? (
                    <a href={`/admin/collections/${source}-translations/${translation.id}`}>
                      编辑翻译
                    </a>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => create(language.id)}>
                      创建翻译
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          {!data && !error && <p>正在读取语言…</p>}
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
