'use client'
import { useState, type FormEvent } from 'react'

export function EquipmentInquiryForm({
  formID,
  product,
  project,
  layout,
  variant,
}: {
  formID?: number | null
  product?: string
  project?: string
  layout?: 'home'
  variant?: 'contact'
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formID) return
    const form = event.currentTarget
    const data = new FormData(form)
    const country = String(data.get('destination-country') || '').trim()
    if (country)
      data.set(
        'e-form-message',
        `${String(data.get('e-form-message') || '').trim()}\nDestination country: ${country}`,
      )
    const fields = [
      'e-form-first-name',
      'e-form-last-name',
      'e-form-email',
      'e-form-message',
      'checkbox_e-form-checkbox',
    ]
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: formID,
          submissionData: fields.map((field) => ({
            field,
            value:
              field === 'checkbox_e-form-checkbox'
                ? String(data.has(field))
                : String(data.get(field) || '').trim(),
          })),
        }),
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(
          result.errors?.[0]?.message ||
            'Your inquiry could not be saved. Please retry or contact us by email.',
        )
      }
      setStatus('success')
      form.reset()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not connect. Please retry or contact us by email.',
      )
      setStatus('error')
    }
  }
  if (status === 'success')
    return (
      <div className="yl-form-success" role="status">
        <h3>Your project inquiry has been received.</h3>
        <p>Your inquiry has been recorded for follow-up.</p>
        <button
          className="yl-button yl-button-outline"
          onClick={() => setStatus('idle')}
          type="button"
        >
          Send another inquiry
        </button>
      </div>
    )
  if (!formID)
    return (
      <div className="yl-empty">
        <p>
          The inquiry form is not available yet. Please contact the Yueli team by email or
          telephone.
        </p>
      </div>
    )
  return (
    <form
      className={`yl-inquiry${layout === 'home' ? ' yl-inquiry-home' : ''}${variant === 'contact' ? ' yl-inquiry-contact' : ''}`}
      onSubmit={submit}
      aria-busy={status === 'sending'}
    >
      <div className="yl-form-row">
        <label>
          Name
          <input
            name="e-form-first-name"
            autoComplete="name"
            placeholder={layout === 'home' ? 'Name' : 'Full name'}
            required
            maxLength={1000}
          />
        </label>
        {layout === 'home' && (
          <label>
            Email
            <input
              name="e-form-email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              required
              maxLength={1000}
            />
          </label>
        )}
        <label>
          Company
          <input
            name="e-form-last-name"
            autoComplete="organization"
            placeholder={layout === 'home' ? 'Company' : 'Company name'}
            required
            maxLength={1000}
          />
        </label>
        {layout === 'home' && (
          <label>
            Destination country
            <input
              name="destination-country"
              autoComplete="country-name"
              placeholder="Destination country"
              maxLength={300}
            />
          </label>
        )}
      </div>
      {layout !== 'home' && (
        <label>
          Email
          <input
            name="e-form-email"
            type="email"
            autoComplete="email"
            placeholder="Business email"
            required
            maxLength={1000}
          />
        </label>
      )}
      <label className={layout === 'home' ? 'yl-home-message' : undefined}>
        Project Requirement
        <textarea
          name="e-form-message"
          rows={5}
          placeholder={
            layout === 'home'
              ? 'Project requirements'
              : 'Workpiece, process, tolerance, target output and destination country'
          }
          defaultValue={[
            product ? `Equipment of interest: ${product}` : '',
            project ? `Project topic: ${project}` : '',
          ]
            .filter(Boolean)
            .join('\n')}
          required
          maxLength={10000}
        />
      </label>
      {layout !== 'home' && (
        <label className="yl-checkbox">
          <input type="checkbox" name="checkbox_e-form-checkbox" />I confirm this is a business
          inquiry
        </label>
      )}
      {status === 'error' && (
        <p className="yl-form-error" role="alert">
          {error}
        </p>
      )}
      <button className="yl-button" type="submit" disabled={status === 'sending'}>
        {status === 'sending'
          ? 'Saving inquiry…'
          : layout === 'home'
            ? 'Send Project Inquiry'
            : 'Submit'}
      </button>
      {layout !== 'home' && <p className="yl-form-note">Your inquiry is recorded for follow-up.</p>}
    </form>
  )
}
