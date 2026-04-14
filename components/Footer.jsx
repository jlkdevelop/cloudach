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
            <a href="#">Deploy</a>
            <a href="#">Fine-tuning</a>
            <a href="#">Autoscaling</a>
            <a href="#">Private VPC</a>
          </div>
          <div className="fcol">
            <h5>Models</h5>
            <a href="#">Model library</a>
            <a href="#">Custom weights</a>
            <a href="#">HuggingFace</a>
            <a href="#">Benchmarks</a>
          </div>
          <div className="fcol">
            <h5>Developers</h5>
            <a href="#">Documentation</a>
            <a href="#">API reference</a>
            <a href="#">CLI</a>
            <a href="#">Status</a>
          </div>
          <div className="fcol">
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className="foot-bar">
        <p>© 2026 Cloudach, Inc. All rights reserved.</p>
        <div className="foot-bar-links">
          <a href="#">Privacy policy</a>
          <a href="#">Terms of service</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  )
}
