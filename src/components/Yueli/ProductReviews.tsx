'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'

type PublicReview = {
  id: number
  authorName: string
  comment: string
  rating: number
  createdAt: string
}

export function ProductReviews({
  productID,
  productTitle,
  onCountChange,
}: {
  productID: number
  productTitle?: string
  onCountChange?: (count: number) => void
}) {
  const fieldID = useId()
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const query = new URLSearchParams({
      'where[and][0][product][equals]': String(productID),
      'where[and][1][status][equals]': 'published',
      depth: '0',
      locale: 'en',
      limit: '10',
      page: String(page),
      sort: '-createdAt',
      'select[authorName]': 'true',
      'select[comment]': 'true',
      'select[rating]': 'true',
      'select[createdAt]': 'true',
    })
    async function loadReviews() {
      setLoading(true)
      setLoadError('')
      try {
        const response = await fetch(`/api/equipment-reviews?${query}`, {
          credentials: 'omit',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Reviews could not be loaded. Please retry.')
        const result = await response.json()
        if (!Array.isArray(result.docs) || typeof result.totalDocs !== 'number')
          throw new Error('Reviews could not be loaded. Please retry.')
        setReviews(result.docs)
        setTotal(result.totalDocs)
        onCountChange?.(result.totalDocs)
      } catch (cause) {
        if (!controller.signal.aborted)
          setLoadError(
            cause instanceof Error ? cause.message : 'Reviews could not be loaded. Please retry.',
          )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void loadReviews()
    return () => controller.abort()
  }, [productID, page, reload, onCountChange])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/equipment-reviews', {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productID,
          rating: Number(fields.get('rating')),
          comment: String(fields.get('comment') || '').trim(),
          authorName: String(fields.get('authorName') || '').trim(),
          email: String(fields.get('email') || '').trim(),
        }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(
          result?.errors?.[0]?.message ||
            'Your review could not be saved. Please retry or contact Yueli by email.',
        )
      }
      form.reset()
      setStatus('success')
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Your review could not be saved. Please retry or contact Yueli by email.',
      )
      setStatus('error')
    }
  }

  return (
    <div className="yl-reviews">
      <h2>Reviews</h2>
      <div aria-busy={loading}>
        {loading ? (
          <div className="yl-reviews-loading" role="status">
            <span>Loading reviews…</span>
            <div />
            <div />
          </div>
        ) : loadError ? (
          <p role="alert">
            {loadError}{' '}
            <button type="button" className="yl-review-retry" onClick={() => setReload(reload + 1)}>
              Retry
            </button>
          </p>
        ) : reviews.length ? (
          <ol className="yl-review-list">
            {reviews.map((review) => (
              <li key={review.id}>
                <div className="yl-review-meta">
                  <strong>{review.authorName}</strong>
                  <time dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                  <span className="yl-review-stars" aria-label={`${review.rating} out of 5 stars`}>
                    <span aria-hidden="true">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                  </span>
                </div>
                <p>{review.comment}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p>There are no reviews yet.</p>
        )}
      </div>
      {total > 10 && (
        <nav className="yl-reviews-pages" aria-label="Review pages">
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            {page} / {Math.ceil(total / 10)}
          </span>
          <button
            type="button"
            disabled={page * 10 >= total || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
      <div className="yl-review-form-wrap">
        <h3>
          {total ? 'Add a review' : 'Be the first to review'}
          {productTitle && <> “{productTitle}”</>}
        </h3>
        <p>Your email address will not be published. Required fields are marked *.</p>
        {status === 'success' ? (
          <div className="yl-review-success" role="status">
            <p>Your review has been received and is awaiting moderation.</p>
            <button type="button" className="yl-review-retry" onClick={() => setStatus('idle')}>
              Write another review
            </button>
          </div>
        ) : (
          <form className="yl-review-form" onSubmit={submit} aria-busy={status === 'sending'}>
            <label htmlFor={`${fieldID}-rating`}>
              Your rating *
              <select id={`${fieldID}-rating`} name="rating" defaultValue="" required>
                <option value="" disabled>
                  Rate…
                </option>
                <option value="5">Perfect</option>
                <option value="4">Good</option>
                <option value="3">Average</option>
                <option value="2">Not that bad</option>
                <option value="1">Very poor</option>
              </select>
            </label>
            <label htmlFor={`${fieldID}-comment`}>
              Your review *
              <textarea
                id={`${fieldID}-comment`}
                name="comment"
                rows={6}
                required
                maxLength={5000}
              />
            </label>
            <div className="yl-review-identity">
              <label htmlFor={`${fieldID}-name`}>
                Name *
                <input
                  id={`${fieldID}-name`}
                  name="authorName"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
              <label htmlFor={`${fieldID}-email`}>
                Email *
                <input
                  id={`${fieldID}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            </div>
            {status === 'error' && (
              <p className="yl-review-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="yl-review-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Saving review…' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
