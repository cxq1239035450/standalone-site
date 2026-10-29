'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function SourceLayoutWithForm({ html, form }: { html: string; form: ReactNode }) {
  const container = useRef<HTMLDivElement>(null)
  const [slot, setSlot] = useState<Element | null>(null)
  useEffect(() => {
    setSlot(container.current?.querySelector('#yueli-inquiry-slot') || null)
  }, [html])
  return (
    <>
      <div
        ref={container}
        className="yl-original-layout"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {slot && createPortal(form, slot)}
    </>
  )
}
