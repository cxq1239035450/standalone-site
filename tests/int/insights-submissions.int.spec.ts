// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import type { Config, PayloadRequest } from 'payload'
import { submissionFields, withSubmissionFields } from '../../src/integrations/insights/submissions'

describe('private insights submission fields', () => {
  it('matches configured labels and preserves unknown keys, empty values and order', () => {
    expect(submissionFields({ submissionData: [
      { field: 'email', value: 'test@example.test' }, { field: 'old_field', value: '0' }, { field: 'consent', value: 'false' }, { field: 'empty', value: '' },
    ] }, { fields: [{ blockType: 'email', name: 'email', label: '联系邮箱' }] })).toEqual([
      { key: 'email', label: '联系邮箱', value: 'test@example.test' }, { key: 'old_field', label: 'old_field', value: '0' },
      { key: 'consent', label: 'consent', value: 'false' }, { key: 'empty', label: 'empty', value: '' },
    ])
  })

  it('does not read private data when the original plugin rejects authentication', async () => {
    const find = vi.fn()
    const config = withSubmissionFields({ endpoints: [{ path: '/insights/v1/submissions', method: 'get', handler: async () => Response.json({}, { status: 401 }) }] } as unknown as Config)
    const response = await config.endpoints![0].handler({ payload: { find } } as unknown as PayloadRequest)
    expect(response.status).toBe(401)
    expect(find).not.toHaveBeenCalled()
  })

  it('enriches only authorized page IDs and does not return unrelated form configuration', async () => {
    const find = vi.fn().mockResolvedValueOnce({ docs: [{ id: 7, form: 3, submissionData: [{ field: 'message', value: '<script>alert(1)</script>\nHello' }] }] })
      .mockResolvedValueOnce({ docs: [{ id: 3, title: '设备咨询', fields: [{ name: 'message', label: '需求详情' }], emails: ['private@example.test'] }] })
    const config = withSubmissionFields({ endpoints: [{ path: '/insights/v1/submissions', method: 'get', handler: async () => Response.json({ schemaVersion: 1, siteId: 'test', nextPage: 2, records: [{ id: '7', formId: '3', createdAt: '2026-01-01' }] }) }] } as unknown as Config)
    const response = await config.endpoints![0].handler({ payload: { find } } as unknown as PayloadRequest)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    const data = await response.json()
    expect(data.nextPage).toBe(2)
    expect(data.records[0]).toMatchObject({ formName: '设备咨询', fields: [{ key: 'message', label: '需求详情', value: '<script>alert(1)</script>\nHello' }] })
    expect(JSON.stringify(data)).not.toContain('private@example.test')
    expect(find.mock.calls[0][0]).toMatchObject({ where: { id: { in: ['7'] } }, overrideAccess: true, depth: 0 })
  })

  it('fails closed without leaking query errors', async () => {
    const config = withSubmissionFields({ endpoints: [{ path: '/insights/v1/submissions', method: 'get', handler: async () => Response.json({ records: [{ id: '7', formId: '3' }] }) }] } as unknown as Config)
    const response = await config.endpoints![0].handler({ payload: { find: vi.fn().mockRejectedValue(new Error('private token')) } } as unknown as PayloadRequest)
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private token')
  })
})
