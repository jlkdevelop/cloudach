import Logo from './Logo'

export default function Nav() {
  return (
    <nav className="nav">
      <div className="logo">
        <Logo size={28} />
        <span className="logo-text">cloud<span>ach</span></span>
      </div>
      <div className="nav-links">
        <a href="#platform">Platform</a>
        <a href="#models">Models</a>
        <a href="#pricing">Pricing</a>
        <a href="#">Docs</a>
        <a href="#">Enterprise</a>
      </div>
      <div className="nav-right">
        <button className="btn-ghost">Sign in</button>
        <button className="btn-solid">Get started free</button>
      </div>
    </nav>
  )
}
