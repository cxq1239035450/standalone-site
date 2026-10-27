import Link from 'next/link'
export default function NotFound() {
  return (
    <section className="yl-wrap yl-section">
      <div className="yl-empty">
        <h1>This page is not available.</h1>
        <p>Browse the equipment catalog or contact Yueli for help finding the right machine.</p>
        <Link className="yl-button" href="/products/">
          View Products
        </Link>
      </div>
    </section>
  )
}
