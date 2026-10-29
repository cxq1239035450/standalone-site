'use client'

import { useFormFields, useLocale, useTranslation } from '@payloadcms/ui'
import { Globe2, MapPin, Monitor, Smartphone } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getServerSideURL } from '@/utilities/getURL'
import { productSearchURL, searchDescription, searchTitle } from '@/utilities/seoPresentation'
import './index.scss'

type Settings = {
  siteName?: string
  siteUrl?: string
  description?: string
  allowIndexing?: boolean
  languageCode?: string
  productSlug?: string
  productNoIndex?: boolean
}

export default function ProductSearchPreview() {
  const { code: legacyLocale = 'zh' } = useLocale()
  const { i18n } = useTranslation()
  const english = i18n.language === 'en'
  const values = useFormFields(([fields]) => ({
    title: fields['meta.title']?.value,
    description: fields['meta.description']?.value,
    productTitle: fields.title?.value,
    shortDescription: fields['general.shortDescription']?.value,
    summary: fields['discovery.summary']?.value,
    slug: fields.slug?.value,
    targetMarkets: fields['meta.targetMarkets']?.value,
    manufacturingOrigin: fields['meta.manufacturingOrigin']?.value,
    noIndex: fields['discovery.noIndex']?.value,
    language: fields.language?.value,
    subject: fields.subject?.value,
  }))
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')
  const [retry, setRetry] = useState(0)
  const [remote, setRemote] = useState<{ locale: string; settings?: Settings; failed?: boolean }>()
  const requestKey = values.language ? `${values.language}:${values.subject}` : legacyLocale
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const url = values.language ? `/api/translations/preview-settings?language=${values.language}&subject=${values.subject}` : `/api/globals/search-settings?locale=${encodeURIComponent(legacyLocale)}&depth=0`
    fetch(url, {
      credentials: 'same-origin',
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Settings unavailable')
        const settings: Settings = await response.json()
        if (active) setRemote({ locale: requestKey, settings })
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setRemote({ locale: requestKey, failed: true })
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [legacyLocale, requestKey, values.language, values.subject, retry])
  const settings = remote?.locale === requestKey ? remote.settings : undefined
  const failed = remote?.locale === requestKey && remote.failed
  const locale = settings?.languageCode || legacyLocale
  const string = (value: unknown) => (typeof value === 'string' ? value : '')
  const siteName = settings?.siteName || 'PawSupply'
  let origin = getServerSideURL()
  try {
    origin = new URL(settings?.siteUrl || origin).origin
  } catch {
    origin = new URL(getServerSideURL()).origin
  }
  const title = searchTitle(string(values.title) || string(values.productTitle), siteName)
  const description = searchDescription(
    string(values.description) || string(values.shortDescription) || string(values.summary),
    settings?.description,
    locale,
  )
  const slug = settings?.productSlug || string(values.slug)
  const url = slug ? productSearchURL(origin, locale, slug) : `${origin}/${locale}/products/…`
  const noIndex = values.noIndex === true || settings?.productNoIndex === true || settings?.allowIndexing === false
  const targetMarkets = string(values.targetMarkets).trim()
  const manufacturingOrigin = string(values.manufacturingOrigin).trim()

  return (
    <section
      className="product-search-preview"
      aria-label={english ? 'Search appearance preview' : '搜索展示效果预览'}
    >
      <div className="product-search-preview__toolbar">
        <h4>{english ? 'Search appearance preview' : '搜索展示效果预览'}</h4>
        <div role="group" aria-label={english ? 'Preview device' : '预览设备'}>
          <button
            type="button"
            aria-pressed={mode === 'desktop'}
            onClick={() => setMode('desktop')}
          >
            <Monitor size={15} aria-hidden />
            {english ? 'Desktop' : '桌面'}
          </button>
          <button type="button" aria-pressed={mode === 'mobile'} onClick={() => setMode('mobile')}>
            <Smartphone size={15} aria-hidden />
            {english ? 'Mobile' : '手机'}
          </button>
        </div>
      </div>
      <p className="product-search-preview__hint">
        {english
          ? 'Live simulation of your current edits. Actual search results are determined by search engines.'
          : '随当前填写内容实时变化；这是模拟效果，实际搜索结果由搜索引擎决定。'}
      </p>
      {!settings && (
        <p role="status" className="product-search-preview__hint">
          {failed
            ? english
              ? 'Site settings could not be loaded; showing fallback settings.'
              : '站点配置加载失败，暂使用默认配置预览。'
            : english
              ? 'Loading site settings…'
              : '正在读取站点配置…'}
          {failed && (
            <button type="button" onClick={() => setRetry((value) => value + 1)}>
              {english ? 'Retry' : '重试'}
            </button>
          )}
        </p>
      )}
      {noIndex && (
        <p className="product-search-preview__notice" role="status">
          {english
            ? 'Noindex is enabled. This preview does not mean the page will appear in search.'
            : '当前设置为不索引（noindex），预览不代表页面会出现在搜索结果中。'}
        </p>
      )}
      {!slug && (
        <p className="product-search-preview__hint">
          {english
            ? 'Set the product slug to preview its full URL.'
            : '填写产品 URL 标识（Slug）后显示完整网址。'}
        </p>
      )}
      <div className={`product-search-preview__frame product-search-preview__frame--${mode}`}>
        <div className="product-search-preview__result">
          <div className="product-search-preview__identity">
            <span className="product-search-preview__globe">
              <Globe2 size={19} aria-hidden />
            </span>
            <div>
              <span className="product-search-preview__site">{siteName}</span>
              <span className="product-search-preview__url">{url}</span>
            </div>
          </div>
          <div className="product-search-preview__title">{title}</div>
          <p className="product-search-preview__description">{description}</p>
        </div>
        {(targetMarkets || manufacturingOrigin) && (
          <div className="product-search-preview__geo">
            <strong>{english ? 'Sourcing information preview' : '采购信息补充预览'}</strong>
            {manufacturingOrigin && (
              <p>
                <MapPin size={14} aria-hidden />
                <span>
                  {english ? 'Origin' : '产地'}：{manufacturingOrigin}
                </span>
              </p>
            )}
            {targetMarkets && (
              <p>
                <Globe2 size={14} aria-hidden />
                <span>
                  {english ? 'Target markets' : '目标市场'}：{targetMarkets}
                </span>
              </p>
            )}
            <small>
              {english
                ? 'Shown on your product page; search engines may display different information.'
                : '在产品详情页展示，不代表搜索引擎会显示此区域。'}
            </small>
          </div>
        )}
      </div>
      <p className="product-search-preview__hint">
        {english ? 'Title' : '标题'} {Array.from(title).length} · {english ? 'Description' : '描述'}{' '}
        {Array.from(description).length}{' '}
        {english
          ? 'characters. Length is informational, not a ranking score.'
          : '字符。字数仅供参考，不代表排名评分。'}
      </p>
    </section>
  )
}
