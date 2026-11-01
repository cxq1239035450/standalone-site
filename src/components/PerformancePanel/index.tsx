'use client'

import React, { useEffect, useState } from 'react'
import { Button, useConfig } from '@payloadcms/ui'
import * as Dialog from '@radix-ui/react-dialog'
import { LoaderCircle, RefreshCw, X } from 'lucide-react'
import '../RecordView/modal.css'
import './style.css'

type Status = {
  checkedAt: string; mediaEnabled: boolean; contentEnabled: boolean
  assets: { count: number; bytes: number; hits: number; generated: number; failures: number; active: number; queued: number }
  content: { hits: number; misses: number }
}
export default function PerformancePanel() {
  const { config } = useConfig()
  const [status, setStatus] = useState<Status>()
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    fetch(`${config.routes.api}/performance/status`, { cache: 'no-store', signal: abort.signal })
      .then(async response => {
        if (!response.ok) throw new Error('缓存状态读取失败，请重试。')
        setStatus(await response.json())
      }).catch(reason => { if (!abort.signal.aborted) setError(reason.message) })
      .finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [config.routes.api, refresh])
  return <section className="performance-panel" aria-busy={loading}>
    <div className="performance-heading">
      <strong>性能与缓存</strong>
      <div>
        <Button buttonStyle="secondary" size="small" disabled={loading} onClick={() => { setLoading(true); setError(''); setRefresh(value => value + 1) }}>
          {loading ? <LoaderCircle className="record-spinner" size={14} /> : <RefreshCw size={14} />} {loading ? '正在读取…' : '刷新状态'}
        </Button>
        <Button buttonStyle="secondary" size="small" onClick={() => setOpen(true)}>查看策略</Button>
      </div>
    </div>
    {error && <p role="alert" className="record-error">{error}</p>}
    {status && <>
      <dl className="performance-metrics">
        <div><dt>媒体缓存</dt><dd>{status.mediaEnabled ? '已启用' : '已关闭'}</dd></div>
        <div><dt>已生成文件</dt><dd>{status.assets.count} 个</dd></div>
        <div><dt>占用空间</dt><dd>{(status.assets.bytes / 1024 / 1024).toFixed(1)} MB</dd></div>
        <div><dt>公开正文缓存</dt><dd>{status.contentEnabled ? '已启用 · 实时校验版本' : '已关闭'}</dd></div>
      </dl>
      <p className="record-description">最近检查：{new Date(status.checkedAt).toLocaleString()}。后台、预览与询盘保持实时读取。</p>
    </>}
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal><Dialog.Overlay className="record-overlay" /><Dialog.Content className="record-modal">
        <div className="record-modal-heading"><Dialog.Title>缓存策略与运行状态</Dialog.Title><Dialog.Close className="record-icon-button" aria-label="关闭"><X size={20} /></Dialog.Close></div>
        <Dialog.Description className="record-description">文件按内容生成独立地址，更新文件后使用新地址；修改名称或翻译不重复下载文件。撤回内容和禁用语言会实时校验。</Dialog.Description>
        <p>刷新状态只重新读取统计，不清空访客缓存。旧文件保留以支持已打开的页面和回滚，不能直接全部删除。</p>
        {status && <dl className="performance-metrics">
          <div><dt>正文缓存命中 / 未命中</dt><dd>{status.content.hits} / {status.content.misses}</dd></div>
          <div><dt>媒体地址复用 / 生成</dt><dd>{status.assets.hits} / {status.assets.generated}</dd></div>
          <div><dt>媒体处理失败</dt><dd>{status.assets.failures}</dd></div>
          <div><dt>处理中 / 排队</dt><dd>{status.assets.active} / {status.assets.queued}</dd></div>
        </dl>}
        <p className="record-description">计数来自当前服务进程，重启后归零，不代表浏览器或 CDN 命中率；尚未接入 CDN 指标。已有媒体可使用部署文档中的预热迁移命令提前处理。</p>
        <div className="record-modal-footer"><Dialog.Close asChild><Button buttonStyle="secondary">关闭</Button></Dialog.Close></div>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </section>
}
