import type { Config } from 'payload'
import type { Form, FormSubmission } from '@/payload-types'

/** 按当前表单定义补充标签，保留未知键、空值和提交顺序。 */
export function submissionFields(submission: Pick<FormSubmission, 'submissionData'>, form?: Pick<Form, 'fields'>) {
  const labels = new Map((form?.fields ?? []).flatMap(field =>
    'name' in field && field.name ? [[field.name, 'label' in field ? field.label : field.name] as const] : []))
  return (submission.submissionData ?? []).map(row => ({
    key: row.field,
    label: labels.get(row.field) || row.field,
    value: row.value == null ? '' : typeof row.value === 'string' ? row.value : JSON.stringify(row.value),
  }))
}

/** 在原插件完成 Bearer 鉴权之后扩展询盘投影，不开放公共表单读取权限。 */
export function withSubmissionFields(config: Config): Config {
  return { ...config, endpoints: (config.endpoints || []).map(endpoint => {
    if (endpoint.path !== '/insights/v1/submissions' || endpoint.method !== 'get') return endpoint
    return { ...endpoint, handler: async req => {
      const response = await endpoint.handler(req)
      if (!response.ok) return response
      try {
        const envelope = await response.json() as {
          records: { id: string; formId: string; createdAt: string }[]
        }
        if (!envelope.records.length) return Response.json(envelope, { headers: { 'Cache-Control': 'no-store' } })
        // 身份已经由原插件的集成 Token 验证；固定集合及页内 ID，不接受客户端 where/select。
        const submissions = await req.payload.find({
          collection: 'form-submissions', req, overrideAccess: true, depth: 0, limit: 100,
          where: { id: { in: envelope.records.map(row => row.id) } },
          select: { form: true, submissionData: true },
        })
        const formIds = [...new Set(submissions.docs.map(doc => typeof doc.form === 'object' ? doc.form.id : doc.form))]
        const forms = formIds.length ? await req.payload.find({
          collection: 'forms', req, overrideAccess: true, depth: 0, limit: 100,
          where: { id: { in: formIds } }, select: { title: true, fields: true },
        }) : { docs: [] }
        const records = envelope.records.map(record => {
          const doc = submissions.docs.find(item => String(item.id) === record.id)
          if (!doc) throw new Error('Submission changed during sync')
          const form = forms.docs.find(item => String(item.id) === record.formId)
          return { ...record, formName: form?.title || `表单 ${record.formId}`, fields: submissionFields(doc, form) }
        })
        return Response.json({ ...envelope, records }, { headers: { 'Cache-Control': 'no-store' } })
      } catch {
        // 不把询盘内容或底层数据库异常写入日志/响应。
        return Response.json({ error: 'Submission details unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
      }
    } }
  }) }
}
