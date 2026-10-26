import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { JSONFieldClientProps } from 'payload'

const state = vi.hoisted(() => ({
  template: 1 as number | null,
  locale: 'zh',
  processing: false,
  values: {} as Record<string, Record<string, string>>,
  setValue: vi.fn(),
}))
vi.mock('@payloadcms/ui', () => ({
  useField: () => ({ value: state.values, setValue: state.setValue, disabled: false }),
  useFormFields: (selector: (value: unknown) => unknown) =>
    selector([{ industryTemplate: { value: state.template } }]),
  useLocale: () => ({ code: state.locale }),
  useTranslation: () => ({ i18n: { language: 'zh' } }),
  useFormProcessing: () => state.processing,
  FieldError: () => null,
  FieldLabel: ({ htmlFor, label, as }: { htmlFor?: string; label: string; as?: string }) =>
    React.createElement(as || 'label', { htmlFor }, label),
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode
    disabled: boolean
    onClick: () => void
  }) => React.createElement('button', { disabled, onClick, type: 'button' }, children),
}))
import IndustryParameters from '@/components/IndustryParameters'
const props = {
  path: 'technicalValues',
  field: { name: 'technicalValues', type: 'json', label: '行业参数' },
} as JSONFieldClientProps
const template = {
  title: '测试模板',
  sectionTitle: '规格',
  fields: [
    { key: 'size', label: '尺寸', type: 'number', required: true },
    { key: 'material', label: '材质', type: 'select', options: [{ value: 'cotton', label: '棉' }] },
  ],
}
function response(data: unknown, ok = true) {
  return { ok, json: async () => data } as Response
}
beforeEach(() => {
  state.template = 1
  state.locale = 'zh'
  state.processing = false
  state.values = {}
  state.setValue.mockReset()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(template)))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
describe('Industry parameter editor', () => {
  it('preserves other templates and accepts incomplete drafts without filling defaults', async () => {
    state.values = { '1': { material: 'removed' }, '2': { voltage: '220' } }
    render(React.createElement(IndustryParameters, props))
    const input = (await screen.findByLabelText('尺寸')) as HTMLInputElement
    expect(input.required).toBe(false)
    expect(state.setValue).not.toHaveBeenCalled()
    expect(await screen.findByText('选项已移除，请重新选择；修改前仍保留原值。')).toBeTruthy()
    fireEvent.change(input, { target: { value: '15.5' } })
    expect(state.setValue).toHaveBeenLastCalledWith({
      '1': { material: 'removed', size: '15.5' },
      '2': { voltage: '220' },
    })
  })
  it('discards late template responses and locks edits while saving', async () => {
    let finishFirst!: (response: Response) => void
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFirst = resolve
        }),
    )
    const view = render(React.createElement(IndustryParameters, props))
    state.template = 2
    state.processing = true
    view.rerender(React.createElement(IndustryParameters, props))
    const input = (await screen.findByLabelText('尺寸')) as HTMLInputElement
    expect(input.readOnly).toBe(true)
    fireEvent.change(input, { target: { value: '30' } })
    expect(state.setValue).not.toHaveBeenCalled()
    await act(async () =>
      finishFirst(
        response({ title: '旧模板', fields: [{ key: 'old', label: '旧字段', type: 'text' }] }),
      ),
    )
    expect(screen.queryByLabelText('旧字段')).toBeNull()
    expect(screen.getByText(/已切换模板/)).toBeTruthy()
  })
  it('reloads localized labels, retries failures, and explains empty templates', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({}, false))
    const view = render(React.createElement(IndustryParameters, props))
    fireEvent.click(await screen.findByRole('button', { name: '重试' }))
    await screen.findByLabelText('尺寸')
    state.locale = 'en'
    vi.mocked(fetch).mockResolvedValueOnce(response({ title: 'Empty', fields: [] }))
    view.rerender(React.createElement(IndustryParameters, props))
    await screen.findByText('该模板尚未配置参数，请先在行业模板中添加参数定义。')
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.at(-1)?.[0]).toContain('locale=en'))
  })
  it('does not request or mutate values without a selected template', () => {
    state.template = null
    render(React.createElement(IndustryParameters, props))
    expect(screen.getByText('请先在上方选择行业模板，再填写对应参数。')).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
    expect(state.setValue).not.toHaveBeenCalled()
  })
})
