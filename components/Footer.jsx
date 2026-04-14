import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer>
      <div className="footer-wrap">
        <div className="fbrand">
          <div className="logo">
            <Logo size={24} />
            <span className="logo-text" style={{ fontSize: 15 }}>cloud<span>ach</span></span>
          </div>
          <p>LLM cloud infrastructure for developers and enterprises.</p>
        </div>
        <div className="flinks">
          <div className="fcol">
            <h5>Platform</h5>
            <a href="#platform">Deploy</a>
            <a href="#platform">Fine-tuning</a>
            <a href="#platform">Autoscaling</a>
            <Link href="/enterprise">Private VPC</Link>
          </div>
          <div className="fcol">
            <h5>Models</h5>
            <a href="#models">Model library</a>
            <a href="#models">Custom weights</a>
            <a href="#models">HuggingFace</a>
            <Link href="/docs#benchmarks">Benchmarks</Link>
          </div>
          <div className="fcol">
            <h5>Developers</h5>
            <Link href="/docs">Documentation</Link>
            <Link href="/docs#api-reference">API reference</Link>
            <Link href="/docs#cli">CLI</Link>
            <Link href="/status">Status</Link>
          </div>
          <div className="fcol">
            <h5>Company</h5>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/enterprise">Enterprise</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="foot-bar">
        <p>© 2026 Cloudach, Inc. All rights reserved.</p>
        <div className="foot-bar-links">
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
          <Link href="/acceptable-use">Acceptable use</Link>
        </div>
      </div>
    </footer>
  )
}
