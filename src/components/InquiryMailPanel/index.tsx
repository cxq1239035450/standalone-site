'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { AlertTriangle, CheckCircle2, Eye, LoaderCircle, Mail, Pencil, RefreshCw, Send, X } from 'lucide-react'
import '../RecordView/modal.css'
import './style.css'

type Delivery = {
  id: number | string
  kind: 'test' | 'inquiry'
  status: 'pending' | 'sending' | 'sent' | 'failed'
  subject?: string
  bodyText?: string
  recipients?: string[]
  acceptedRecipients?: string[]
  fromName?: string
  fromEmail?: string
  attempts?: number
  lastError?: string | null
  startedAt?: string | null
  sentAt?: string | null
  confirmedAt?: string | null
  createdAt?: string
  messageId?: string | null
}
type Status = {
  configured: boolean
  enabled: boolean
  fromEmail: string
  fromName: string
  recipients: string[]
  subjectPrefix: string
  configurationIssues: string[]
  lastTest: Delivery | null
  canEnable: boolean
  workerMode: 'automatic' | 'external' | 'unconfigured'
}
type Records = { docs: Delivery[]; totalDocs: number; totalPages: number }
type Modal = { type: 'test' } | { type: 'detail' | 'retry'; delivery: Delivery }
type Props = { onEdit?: () => void; refreshKey?: unknown }

const statusLabels: Record<Delivery['status'], string> = {
  pending: '等待发送', sending: '正在发送', sent: 'SMTP 已接受', failed: '发送失败',
}
const time = (value?: string | null) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
const addresses = (value?: string[]) => value?.length ? value.join('、') : '未配置'
const errorText = (value: { errors?: { message?: string }[]; error?: string; message?: string }) =>
  value.errors?.map(item => item.message).filter(Boolean).join('；') || value.error || value.message || '请求失败，请重试。'

export default function InquiryMailPanel({ onEdit, refreshKey }: Props) {
  const { config } = useConfig()
  const { lastUpdateTime } = useDocumentInfo()
  const [now, setNow] = useState(() => Date.now())
  const [filter, setFilter] = useState('failed')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [remote, setRemote] = useState<{ key: string; status?: Status; records?: Records; error?: string }>()
  const [modal, setModal] = useState<Modal | null>(null)
  const [detail, setDetail] = useState<{ id: string; record?: Delivery; error?: string }>()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ success: boolean; text: string }>()
  const [modalError, setModalError] = useState('')
  const mutation = useRef<AbortController | null>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const requestKey = JSON.stringify([filter, page, revision, refreshKey, lastUpdateTime])
  const loading = remote?.key !== requestKey
  const status = remote?.status
  const records = remote?.key === requestKey ? remote.records : undefined
  const error = remote?.key === requestKey ? remote.error : undefined
  const detailID = modal?.type === 'detail' ? String(modal.delivery.id) : undefined
  const detailLoading = Boolean(detailID && detail?.id !== detailID)

  useEffect(() => () => mutation.current?.abort(), [])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const query = new URLSearchParams({ sort: '-createdAt', limit: '10', page: String(page), depth: '0' })
    if (filter) query.set('where[status][equals]', filter)
    const read = async (url: string) => {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(errorText(data))
      return data
    }
    void Promise.all([
      read(`${config.routes.api}/inquiry-mail/status`),
      read(`${config.routes.api}/inquiry-mail-deliveries?${query}`),
    ]).then(([status, records]) => {
      if (!controller.signal.aborted) setRemote({ key: requestKey, status, records })
    }).catch(error => {
      if (!controller.signal.aborted) setRemote({ key: requestKey, error: error.message })
    })
    return () => controller.abort()
  }, [config.routes.api, filter, page, requestKey])

  useEffect(() => {
    if (!detailID) return
    const controller = new AbortController()
    fetch(`${config.routes.api}/inquiry-mail-deliveries/${detailID}?depth=0`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const record = await response.json()
        if (!response.ok) throw new Error(errorText(record))
        if (!controller.signal.aborted) setDetail({ id: detailID, record })
      }).catch(error => {
        if (!controller.signal.aborted) setDetail({ id: detailID, error: error.message })
      })
    return () => controller.abort()
  }, [detailID, config.routes.api, revision])

  const open = (next: Modal) => {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setModalError('')
    setDetail(undefined)
    setModal(next)
  }
  const refresh = () => setRevision(value => value + 1)
  const run = async (action: 'test' | 'retry' | 'confirm', id?: string | number, confirmUncertain = false) => {
    if (busy || mutation.current) return
    const controller = new AbortController()
    mutation.current = controller
    setBusy(true)
    setModalError('')
    setNotice(undefined)
    try {
      const path = action === 'test' ? 'test' : `${id}/${action}`
      const response = await fetch(`${config.routes.api}/inquiry-mail/${path}`, { method: 'POST', signal: controller.signal, ...(confirmUncertain ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmUncertain: true }) } : {}) })
      const result = await response.json()
      if (!response.ok) throw new Error(errorText(result))
      const succeeded = result.delivery?.status !== 'failed'
      setNotice({ success: succeeded, text: result.message || (succeeded ? '操作完成。' : result.delivery?.lastError || '发送失败，请查看记录。') })
      setModal(null)
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : '操作失败，请重试。'
        setModalError(message)
        setNotice({ success: false, text: message })
      }
    } finally {
      if (!controller.signal.aborted) { setBusy(false); refresh() }
      if (mutation.current === controller) mutation.current = null
    }
  }
  const currentDetail = detail && detail.id === detailID ? detail.record : undefined
  const lastTest = status?.lastTest
  const canRecover = (record: Delivery) => record.status === 'sending' && Boolean(record.startedAt) && now - new Date(record.startedAt!).getTime() > 120000

  return <section className="inquiry-mail-panel" aria-label="询盘邮件通知管理">
    <div className="inquiry-mail-heading"><div><h2><Mail size={23}/>询盘邮件通知</h2><p>测试与重发使用已保存配置。请先保存修改，再进行发送操作。</p></div><div className="inquiry-mail-actions">
      <Button type="button" buttonStyle="secondary" margin={false} disabled={loading || busy} icon={<RefreshCw size={16} className={loading ? 'record-spinner' : ''}/>} onClick={refresh}>刷新状态</Button>
      {onEdit && <Button type="button" margin={false} disabled={busy} icon={<Pencil size={16}/>} onClick={onEdit}>编辑邮件配置</Button>}
    </div></div>
    {notice && <div className={`inquiry-mail-notice ${notice.success ? 'is-success' : ''}`} role={notice.success ? 'status' : 'alert'}>{notice.success ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}<span>{notice.text}</span></div>}
    {loading && <div className="record-content-loading" role="status" aria-busy="true"><LoaderCircle className="record-spinner" size={22}/><span>正在加载邮件配置与发送记录…</span></div>}
    {error && <div className="record-error" role="alert"><AlertTriangle size={17}/><span>{error}</span><Button type="button" buttonStyle="secondary" size="small" margin={false} onClick={refresh}>重试加载</Button></div>}
    {!loading && status && <>
      <div className="inquiry-mail-summary">
        <div><span>新询盘通知</span><strong>{status.enabled ? '已开启' : '已关闭'}</strong><small>{status.enabled ? '新询盘保存后进入通知队列。' : '仍可提交询盘，暂不发送新询盘通知。'}</small></div>
        <div><span>邮件服务</span><strong>{status.configured ? 'SMTP 已配置' : '待配置'}</strong><small>{status.fromEmail || '尚未配置实际发件邮箱'}</small></div>
        <div><span>最近一次测试</span><strong>{lastTest ? lastTest.confirmedAt ? '已确认收信' : statusLabels[lastTest.status] : '尚未测试'}</strong><small>{lastTest ? time(lastTest.sentAt || lastTest.createdAt) : '发送测试邮件后，在收件箱确认。'}</small></div>
      </div>
      <dl className="inquiry-mail-settings"><div><dt>收件邮箱</dt><dd>{addresses(status.recipients)}</dd></div><div><dt>发件人</dt><dd>{status.fromName || '网站询盘'}{status.fromEmail ? ` <${status.fromEmail}>` : ' · 邮箱待配置'}</dd></div><div><dt>主题前缀</dt><dd>{status.subjectPrefix}</dd></div><div><dt>发送队列</dt><dd>{status.workerMode === 'automatic' ? '服务运行期间自动处理' : status.workerMode === 'external' ? '需外部任务定时处理 inquiry-mail 队列' : '邮件服务配置完成后启用处理'}</dd></div></dl>
      {!!status.configurationIssues?.length && <div className="inquiry-mail-guidance" role="status"><strong>需要完成的配置</strong><ul>{status.configurationIssues.map(issue => <li key={issue}>{issue}</li>)}</ul></div>}
      <div className="inquiry-mail-test"><div><strong>{status.canEnable ? '已完成测试并确认收信，可在配置中开启通知。' : '先发送测试邮件并确认收到，再开启通知。'}</strong><p>“SMTP 已接受”表示服务商接收了发送请求，不代表邮件已进入收件箱。修改发件或收件配置后需要重新测试。</p>{lastTest?.lastError && <p className="inquiry-mail-last-error">最近测试失败：{lastTest.lastError}</p>}</div><div className="inquiry-mail-actions">
        <Button type="button" buttonStyle="secondary" margin={false} disabled={busy} icon={<Send size={16}/>} onClick={() => open({ type: 'test' })}>发送测试邮件</Button>
        {lastTest?.status === 'sent' && !lastTest.confirmedAt && <Button type="button" margin={false} disabled={busy} icon={busy ? <LoaderCircle className="record-spinner" size={16}/> : <CheckCircle2 size={16}/>} onClick={() => void run('confirm', lastTest.id)}>{busy ? '正在确认…' : '我已收到测试邮件'}</Button>}
      </div></div>
      <details className="inquiry-mail-environment"><summary>QQ SMTP 授权码如何配置</summary><p>在 QQ 邮箱中开启 SMTP 服务并生成授权码，然后配置服务器环境变量。授权码不写入后台数据库，也不在页面回显。</p><pre>{'SMTP_USER=你的完整QQ邮箱\nSMTP_PASS=QQ邮箱SMTP授权码\nSMTP_HOST=smtp.qq.com\nSMTP_PORT=465\nSMTP_SECURE=true\n# 常驻 Node / Docker 服务启用自动消费队列\nINQUIRY_EMAIL_AUTORUN=true'}</pre><p>发件邮箱须与 SMTP_USER 一致。修改环境变量后重启服务，再发送测试邮件。常驻 Node / Docker 服务可启用上述自动队列。无常驻进程的部署应保持自动队列关闭，由外部定时任务调用 /api/payload-jobs/run?queue=inquiry-mail（携带任务授权）。</p></details>
    </>}
    <div className="inquiry-mail-records-heading"><h3>发送记录与重试</h3><label>记录状态<select aria-label="邮件记录状态" value={filter} disabled={busy} onChange={event => { setFilter(event.target.value); setPage(1) }}><option value="failed">发送失败</option><option value="">全部状态</option><option value="pending">等待发送</option><option value="sending">正在发送</option><option value="sent">SMTP 已接受</option></select></label></div>
    {!loading && records && <>
      <div className="inquiry-mail-table-wrap"><table><thead><tr><th>邮件主题 / 类型</th><th>状态</th><th>尝试次数</th><th>最近错误</th><th>时间</th><th>操作</th></tr></thead><tbody>{records.docs.map(record => <tr key={record.id}>
        <td><button type="button" className="inquiry-mail-record-title" onClick={() => open({ type: 'detail', delivery: record })}>{record.subject || `邮件 #${record.id}`}</button><small>{record.kind === 'test' ? '测试邮件' : '新询盘通知'}</small></td><td><span className={`inquiry-mail-badge is-${record.status}`}>{statusLabels[record.status]}</span></td><td>{record.attempts || 0}</td><td>{record.lastError || '—'}</td><td>{time(record.createdAt)}</td><td><div className="inquiry-mail-actions"><Button type="button" buttonStyle="secondary" size="small" margin={false} icon={<Eye size={14}/>} onClick={() => open({ type: 'detail', delivery: record })}>查看</Button>{(record.status === 'pending' || record.status === 'failed' || canRecover(record)) && <Button type="button" buttonStyle="secondary" size="small" margin={false} disabled={busy} icon={<RefreshCw size={14}/>} onClick={() => open({ type: 'retry', delivery: record })}>{record.status === 'pending' ? '立即发送' : record.status === 'sending' ? '核对后重发' : '重发'}</Button>}</div></td>
      </tr>)}</tbody></table>{!records.docs.length && <p className="inquiry-mail-empty">{filter === 'failed' ? '暂无失败记录。' : '暂无符合条件的发送记录。'}</p>}</div>
      <div className="inquiry-mail-pagination"><span>共 {records.totalDocs} 条 · 第 {page} / {Math.max(records.totalPages, 1)} 页</span><div className="inquiry-mail-actions"><Button type="button" buttonStyle="secondary" size="small" margin={false} disabled={page <= 1 || busy} onClick={() => setPage(value => value - 1)}>上一页</Button><Button type="button" buttonStyle="secondary" size="small" margin={false} disabled={page >= records.totalPages || busy} onClick={() => setPage(value => value + 1)}>下一页</Button></div></div>
    </>}
    <Dialog.Root open={modal !== null} onOpenChange={open => { if (!open && !busy) setModal(null) }}><Dialog.Portal><Dialog.Overlay className="record-overlay inquiry-mail-overlay"/><Dialog.Content className="record-modal inquiry-mail-modal" onEscapeKeyDown={event => { if (busy) event.preventDefault() }} onPointerDownOutside={event => { if (busy) event.preventDefault() }} onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus() }}>
      <div className="record-modal-heading"><div className="record-modal-title"><Mail size={22}/><Dialog.Title>{modal?.type === 'detail' ? '邮件发送详情' : modal?.type === 'retry' ? modal.delivery.status === 'pending' ? '确认发送邮件' : '确认重发邮件' : '发送测试邮件'}</Dialog.Title></div><Dialog.Close className="record-icon-button" disabled={busy} aria-label="关闭邮件弹窗"><X size={20}/></Dialog.Close></div>
      <Dialog.Description className="record-description">{modal?.type === 'detail' ? '查看邮件内容与实际发送状态。记录仅供后台查看。' : modal?.type === 'retry' ? modal.delivery.status === 'pending' ? '立即按当前已保存的发件人与收件配置发送原邮件内容。系统会与后台任务协调，避免同时发送。' : '按当前已保存的发件人与收件配置重新发送原邮件内容。询盘通知会跳过已经被 SMTP 接受的收件人；测试邮件的配置发生变化时，会重新测试全部当前收件人。' : '向下面已保存的收件邮箱发送测试通知。发送成功后，请检查收件箱及垃圾邮件。'}</Dialog.Description>
      {modal?.type !== 'detail' && <dl className="inquiry-mail-settings"><div><dt>当前收件邮箱</dt><dd>{addresses(status?.recipients)}</dd></div><div><dt>当前发件人</dt><dd>{status?.fromName} &lt;{status?.fromEmail || '待配置'}&gt;</dd></div>{modal?.type === 'retry' && <div><dt>原邮件主题</dt><dd>{modal.delivery.subject}</dd></div>}</dl>}
      {modal?.type === 'retry' && modal.delivery.status === 'sending' && <div className="inquiry-mail-guidance" role="alert"><strong>发送结果未确认，重发可能造成重复邮件。</strong><p>这条记录已超过两分钟没有返回结果，邮件可能已经送达。请先核对收件箱及垃圾邮件，再确认重发；系统仅能排除已经记录为接受的收件人。</p></div>}
      {modal?.type === 'test' && !status?.configured && <p className="inquiry-mail-guidance">当前邮件服务尚未配置，测试会记录失败原因；补充授权码后可再次测试。</p>}
      {modal?.type === 'detail' && <>
        {detailLoading && <div className="record-content-loading" role="status" aria-busy="true"><LoaderCircle className="record-spinner" size={22}/><span>正在加载邮件详情…</span></div>}
        {detail && detail.id === detailID && detail.error && <div className="record-error" role="alert">{detail.error}<Button type="button" buttonStyle="secondary" margin={false} onClick={() => { setDetail(undefined); refresh() }}>重试加载</Button></div>}
        {currentDetail && <><dl className="inquiry-mail-settings"><div><dt>邮件主题</dt><dd>{currentDetail.subject}</dd></div><div><dt>状态</dt><dd>{statusLabels[currentDetail.status]}{currentDetail.confirmedAt ? ` · 收信确认于 ${time(currentDetail.confirmedAt)}` : ''}</dd></div><div><dt>收件邮箱</dt><dd>{addresses(currentDetail.recipients)}</dd></div><div><dt>已被 SMTP 接受</dt><dd>{currentDetail.acceptedRecipients?.length ? addresses(currentDetail.acceptedRecipients) : '无'}</dd></div><div><dt>发送次数</dt><dd>{currentDetail.attempts || 0}</dd></div><div><dt>最近错误</dt><dd>{currentDetail.lastError || '无'}</dd></div><div><dt>接受时间</dt><dd>{time(currentDetail.sentAt)}</dd></div></dl><h3>邮件正文</h3><pre className="inquiry-mail-body">{currentDetail.bodyText || '—'}</pre></>}
      </>}
      {modalError && <div className="record-error" role="alert"><AlertTriangle size={16}/><span>{modalError}</span></div>}
      <div className="record-modal-footer"><Button type="button" buttonStyle="secondary" margin={false} disabled={busy} onClick={() => setModal(null)}>{modal?.type === 'detail' ? '关闭' : '取消'}</Button>{modal?.type !== 'detail' && <Button type="button" margin={false} disabled={busy || loading} icon={busy ? <LoaderCircle className="record-spinner" size={16}/> : <Send size={16}/>} onClick={() => modal?.type === 'retry' ? void run('retry', modal.delivery.id, modal.delivery.status === 'sending') : void run('test')}>{busy ? '正在发送…' : modal?.type === 'retry' ? modal.delivery.status === 'pending' ? '确认发送' : modal.delivery.status === 'sending' ? '已核对收件箱，确认重发' : '确认重发' : '确认发送测试邮件'}</Button>}</div>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </section>
}
