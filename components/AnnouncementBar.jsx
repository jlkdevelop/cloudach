import Link from 'next/link'

export default function AnnouncementBar() {
  return (
    <Link href="/signup" className="ann-bar" aria-label="Deploy now — your model, live in 60 seconds">
      <div className="ann-bar-inner">
        <span className="ann-bar-pre">Your model, live in 60 seconds.</span>
        <span className="ann-bar-cta">Deploy now →</span>
      </div>
    </Link>
  )
}
