'use client'
import React from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import { messageLeaves, messageTemplate } from '@/i18n/messageValidation'

export default function MessageEditor({ path, readOnly }: JSONFieldClientProps) {
  const { value, setValue, disabled, errorMessage } = useField<Record<string, unknown>>({ path })
  const template = messageLeaves(messageTemplate)
  const actual = messageLeaves(value)
  const namespaces = [...new Set(Object.keys(template).map((key) => key.split('.')[0]))]
  const change = (key: string, text: string) => {
    const next = structuredClone(value || {})
    const parts = key.split('.')
    let target: Record<string, unknown> = next
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]] || typeof target[parts[i]] !== 'object')
        target[parts[i]] = /^\d+$/.test(parts[i + 1]) ? [] : {}
      target = target[parts[i]] as Record<string, unknown>
    }
    target[parts.at(-1)!] = text
    setValue(next)
  }
  return (
    <div>
      <p>按栏目维护前台文案。花括号中的变量必须保留，所有文案填写完成后才能发布。</p>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {namespaces.map((namespace) => (
        <details key={namespace} style={{ marginBottom: 16 }}>
          <summary>{namespace}</summary>
          {Object.entries(template)
            .filter(([key]) => key.split('.')[0] === namespace)
            .map(([key, reference]) => (
              <label key={key} style={{ display: 'block', marginBlock: 12 }}>
                {key}
                <small style={{ display: 'block' }}>参考：{reference}</small>
                <textarea
                  style={{ width: '100%', minHeight: 64 }}
                  value={actual[key] || ''}
                  disabled={disabled || readOnly}
                  onChange={(event) => change(key, event.target.value)}
                />
              </label>
            ))}
        </details>
      ))}
    </div>
  )
}
