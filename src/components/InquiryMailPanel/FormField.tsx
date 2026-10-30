'use client'
import { useDocumentInfo } from '@payloadcms/ui'
import InquiryMailPanel from './index'
export default function FormMailField() {
  const { id } = useDocumentInfo()
  return id ? <InquiryMailPanel formID={Number(id)} /> : <p>保存表单后，可测试邮件转发并查看最终收件人。</p>
}
