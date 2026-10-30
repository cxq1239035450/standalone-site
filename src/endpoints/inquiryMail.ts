import { APIError, type Endpoint, type PayloadRequest } from 'payload'
import { confirmTestMail, deliverMail, mailStatus, publicDelivery, testMail } from '@/email/service'

const requireUser = (req: PayloadRequest) => {
  if (!req.user) throw new APIError('请先登录后台。', 401)
}
const idFrom = (req: PayloadRequest) => {
  const id = Number(req.routeParams?.id)
  if (!Number.isSafeInteger(id) || id <= 0) throw new APIError('无效的通知记录。', 400)
  return id
}
const response = (data: unknown) => Response.json(data, { headers: { 'Cache-Control': 'private, no-store' } })
export const inquiryMailEndpoints: Endpoint[] = [
  { path: '/inquiry-mail/status', method: 'get', handler: async req => { requireUser(req); return response(await mailStatus(req.payload)) } },
  { path: '/inquiry-mail/test', method: 'post', handler: async req => {
    requireUser(req)
    const delivery = await testMail(req.payload)
    return response({ delivery: publicDelivery(delivery), message: delivery.status === 'sent' ? 'SMTP 服务已接受测试邮件，请检查收件箱并确认收信。' : delivery.lastError || '发送失败，已记录原因。' })
  } },
  { path: '/inquiry-mail/:id/retry', method: 'post', handler: async req => {
    requireUser(req)
    const body = await req.json?.().catch(() => ({})) as { confirmUncertain?: boolean } | undefined
    const delivery = await deliverMail(req.payload, idFrom(req), true, body?.confirmUncertain === true)
    return response({ delivery: publicDelivery(delivery), message: delivery.status === 'sent' ? 'SMTP 服务已接受邮件，请检查收件箱。' : delivery.lastError || '重发失败，已记录原因。' })
  } },
  { path: '/inquiry-mail/:id/confirm', method: 'post', handler: async req => {
    requireUser(req)
    const delivery = await confirmTestMail(req.payload, idFrom(req))
    return response({ delivery: publicDelivery(delivery), message: '已确认收到测试邮件，可以开启新询盘通知。' })
  } },
]
