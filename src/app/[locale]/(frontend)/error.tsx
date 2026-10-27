'use client'
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="yl-wrap yl-section">
      <div className="yl-empty">
        <h1>Equipment information is unavailable.</h1>
        <p>Please retry in a moment. If the issue continues, contact the Yueli team by email.</p>
        <button type="button" onClick={reset} className="yl-button">
          Try again
        </button>
      </div>
    </section>
  )
}
