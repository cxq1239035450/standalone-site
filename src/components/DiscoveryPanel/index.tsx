'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button, useConfig } from '@payloadcms/ui'
import { AlertTriangle, Bot, Check, Code2, Copy, Eye, FileText, Globe2, Link2, LoaderCircle, Pencil, RefreshCw, X } from 'lucide-react'
import '../RecordView/modal.css'
import './style.css'

type PreviewType = 'sitemap' | 'canonical' | 'robots' | 'llms'
type Entry = { url: string; language: string; source: string; title?: string; included: boolean; reason?: string }
type Preview = { text: string; entries?: Entry[]; warnings?: string[] }
type Language = { id: number | string; code: string; label: string; enabled: boolean }
type Context = { source: string; subjectID: string; languageID: string }
type Props = { onEdit?: () => void; context?: Context }

const previews = [
  { type: 'sitemap' as const, title: 'sitemap.xml', icon: Globe2, description: '查看公开链接、收录范围和排除原因。' },
  { type: 'canonical' as const, title: 'canonical', icon: Link2, description: '查看页面规范地址、多语言地址和索引状态。' },
  { type: 'robots' as const, title: 'robots.txt', icon: Bot, description: '查看搜索爬虫与 AI 爬虫的抓取规则。' },
  { type: 'llms' as const, title: 'llms.txt', icon: FileText, description: '查看按语言发布的站点简介与推荐内容。' },
]
const sourceLabels: Record<string, string> = { pages: '页面', posts: '文章', products: '商品', core: '固定页面' }

export default function DiscoveryPanel({ onEdit, context }: Props) {
  const { config } = useConfig()
  const [type, setType] = useState<PreviewType | null>(null)
  const [mode, setMode] = useState('published')
  const [language, setLanguage] = useState('')
  const [languages, setLanguages] = useState<Language[]>([])
  const [languageError, setLanguageError] = useState('')
  const [path, setPath] = useState('/')
  const [requestedPath, setRequestedPath] = useState('/')
  const [source, setSource] = useState('')
  const [included, setIncluded] = useState('')
  const [remote, setRemote] = useState<{ key: string; result?: Preview; error?: string }>()
  const [revision, setRevision] = useState(0)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const returnFocus = useRef<HTMLElement | null>(null)
  const subjectID = context?.subjectID
  const languageID = context?.languageID
  const contentSource = context?.source
  const requestKey = JSON.stringify([type, mode, language, requestedPath, revision, contentSource, subjectID, languageID])
  const loading = type !== null && remote?.key !== requestKey
  const result = remote?.key === requestKey ? remote.result : undefined
  const error = remote?.key === requestKey ? remote.error : undefined

  useEffect(() => {
    if (!type || context) return
    const controller = new AbortController()
    fetch(`${config.routes.api}/languages?limit=1000&depth=0&sort=sortOrder`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('语言列表加载失败，可点击刷新重试。')
        const data = await response.json()
        if (!controller.signal.aborted) { setLanguages(data.docs || []); setLanguageError('') }
      })
      .catch(error => { if (!controller.signal.aborted) setLanguageError(error.message) })
    return () => controller.abort()
  }, [type, config.routes.api, revision, context])

  useEffect(() => {
    if (!type) return
    const controller = new AbortController()
    const query = new URLSearchParams({ type, mode })
    if (language && !contentSource) query.set('lang', language)
    if (type === 'canonical') {
      if (contentSource && subjectID && languageID) {
        query.set('source', contentSource)
        query.set('id', subjectID)
        query.set('language', languageID)
      } else query.set('path', requestedPath)
    }
    fetch(`${config.routes.api}/seo/preview?${query}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.errors?.[0]?.message || data.error || '预览加载失败，请重试。')
        if (!controller.signal.aborted) { setRemote({ key: requestKey, result: data }); setCopied(false); setCopyError('') }
      })
      .catch(error => { if (!controller.signal.aborted) setRemote({ key: requestKey, error: error.message }) })
    return () => controller.abort()
  }, [type, mode, language, requestedPath, revision, config.routes.api, contentSource, subjectID, languageID, requestKey])

  const entries = useMemo(() => (result?.entries || []).filter(entry =>
    (!source || entry.source === source) &&
    (!included || entry.included === (included === 'yes')),
  ), [result, source, included])
  const selected = previews.find(item => item.type === type)
  const open = (next: PreviewType, trigger: Element) => {
    returnFocus.current = trigger instanceof HTMLElement ? trigger : null
    setRevision(value => value + 1)
    setLanguageError('')
    setSource('')
    setIncluded('')
    setMode(context ? 'draft' : 'published')
    setType(next)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result?.text || '')
      setCopied(true)
      setCopyError('')
    } catch {
      setCopyError('复制失败，请在下方输出文本中手动选择并复制。')
    }
  }

  return <section className="discovery-panel" aria-label={context ? '页面 SEO 预览' : 'SEO 输出管理'}>
    {context ? <div className="discovery-canonical-field">
      <div><strong>页面 SEO 预览</strong><p>规范地址留空时自动生成；填写自定义地址后，保存草稿即可预览。</p></div>
      <Button type="button" buttonStyle="secondary" margin={false} icon={<Eye size={16}/>} disabled={!subjectID || !languageID} onClick={event => open('canonical', event.currentTarget)}>查看 canonical</Button>
    </div> : <>
      <div className="discovery-panel-header"><div><h2>SEO 输出管理</h2><p>查看当前生效输出，或检查已保存的草稿。</p></div>
        {onEdit && <Button type="button" buttonStyle="secondary" margin={false} icon={<Pencil size={16}/>} onClick={onEdit}>编辑 SEO 配置</Button>}
      </div>
      <div className="discovery-cards">{previews.map(item => <button type="button" key={item.type} className="discovery-card" onClick={event => open(item.type, event.currentTarget)}>
        <item.icon size={22}/><strong>{item.title}</strong><span>{item.description}</span><small>查看输出 <Eye size={14}/></small>
      </button>)}</div>
    </>}
    <Dialog.Root open={type !== null} onOpenChange={open => { if (!open) setType(null) }}>
      <Dialog.Portal><Dialog.Overlay className="record-overlay discovery-overlay"/><Dialog.Content className="record-modal discovery-modal" onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus() }}>
        <div className="record-modal-heading"><div className="record-modal-title"><Code2 size={22}/><Dialog.Title>{selected?.title} 预览</Dialog.Title></div><Dialog.Close className="record-icon-button" aria-label="关闭 SEO 预览"><X size={20}/></Dialog.Close></div>
        <Dialog.Description className="record-description">{mode === 'published' ? '当前公开配置的实际输出。' : '仅预览已保存的草稿；尚未保存的表单修改不会包含在内。内容链接仍按公开发布状态筛选。'}</Dialog.Description>
        <div className="discovery-controls">
          <label>预览版本<select aria-label="预览版本" value={mode} onChange={e => setMode(e.target.value)}><option value="published">当前已发布</option><option value="draft">已保存草稿</option></select></label>
          {!context && type !== 'robots' && <label>语言<select aria-label="预览语言" value={language} onChange={e => setLanguage(e.target.value)}><option value="">{type === 'canonical' ? '默认语言' : '全部语言'}</option>{languages.map(item => <option key={item.id} value={item.code}>{item.label} ({item.code}){!item.enabled ? ' · 未启用' : ''}</option>)}</select></label>}
          <Button type="button" buttonStyle="secondary" margin={false} disabled={loading} onClick={() => setRevision(value => value + 1)} icon={<RefreshCw size={16} className={loading ? 'record-spinner' : ''}/>}>刷新预览</Button>
        </div>
        {type === 'canonical' && !context && <form className="discovery-path" onSubmit={event => { event.preventDefault(); event.stopPropagation(); setRequestedPath(path); setRevision(value => value + 1) }}>
          <label htmlFor="discovery-path">页面路径（不含语言前缀）</label><div><input id="discovery-path" value={path} onChange={e => setPath(e.target.value)} placeholder="/products/example" required pattern="/.*"/><Button type="submit" buttonStyle="secondary" margin={false} disabled={loading}>查看页面</Button></div>
        </form>}
        {languageError && <p className="discovery-warning" role="alert">{languageError}</p>}
        {loading && <div className="record-content-loading" role="status" aria-live="polite" aria-busy="true"><LoaderCircle className="record-spinner" size={24}/><span>正在生成预览…</span></div>}
        {error && <div className="record-error" role="alert"><AlertTriangle size={16}/><span>{error}</span><Button type="button" buttonStyle="secondary" size="small" margin={false} onClick={() => setRevision(value => value + 1)}>重试</Button></div>}
        {!loading && result && <>
          {!!result.warnings?.length && <div className="discovery-warning" role="status">{result.warnings.map((warning, index) => <p key={index}>{warning}</p>)}</div>}
          {!!result.entries?.length && <div className="discovery-entries">
            <div className="discovery-entry-filters"><label>内容类型<select aria-label="内容类型" value={source} onChange={e => setSource(e.target.value)}><option value="">全部类型</option>{Array.from(new Set(result.entries.map(entry => entry.source))).map(item => <option key={item} value={item}>{sourceLabels[item] || item}</option>)}</select></label><label>状态<select aria-label="收录状态" value={included} onChange={e => setIncluded(e.target.value)}><option value="">全部状态</option><option value="yes">已纳入</option><option value="no">已排除</option></select></label><span>共 {entries.length} 条</span></div>
            <div className="discovery-table-wrap"><table><thead><tr><th>页面 / URL</th><th>语言</th><th>类型</th><th>状态与原因</th></tr></thead><tbody>{entries.map((entry, index) => <tr key={`${entry.url}-${index}`}><td><strong>{entry.title || entry.url}</strong><small>{entry.url}</small></td><td>{entry.language}</td><td>{sourceLabels[entry.source] || entry.source}</td><td><span className={`discovery-status ${entry.included ? 'is-included' : ''}`}>{entry.included ? '已纳入' : '已排除'}</span>{entry.reason && <small>{entry.reason}</small>}</td></tr>)}</tbody></table>{!entries.length && <p>没有匹配当前筛选的记录。</p>}</div>
          </div>}
          <div className="discovery-output-heading"><h3>最终输出</h3><Button type="button" buttonStyle="secondary" size="small" margin={false} onClick={copy} icon={copied ? <Check size={15}/> : <Copy size={15}/>}>{copied ? '已复制' : '复制内容'}</Button></div>
          {copyError && <p role="alert">{copyError}</p>}
          <pre className="discovery-output" tabIndex={0} aria-label="最终输出">{result.text || '（当前没有公开输出）'}</pre>
        </>}
        <div className="record-modal-footer"><Button type="button" buttonStyle="secondary" margin={false} onClick={() => setType(null)}>关闭</Button>{onEdit && <Button type="button" margin={false} onClick={() => { returnFocus.current = null; setType(null); onEdit() }} icon={<Pencil size={16}/>}>编辑配置</Button>}</div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </section>
}
