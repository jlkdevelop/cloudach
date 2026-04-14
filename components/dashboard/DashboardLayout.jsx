import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../Logo';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: IconOverview },
  { href: '/dashboard/models', label: 'Models', icon: IconModels },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: IconKey },
  { href: '/dashboard/usage', label: 'Usage', icon: IconUsage },
];

export default function DashboardLayout({ children, user }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="db-shell">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">
          <Logo size={22} />
          <span className="db-sidebar-brand">cloud<span>ach</span></span>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`db-nav-item${active ? ' db-nav-item--active' : ''}`}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-user-chip">
            <div className="db-user-avatar">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
            <span className="db-user-email">{user?.email || 'User'}</span>
          </div>
          <button className="db-logout-btn" onClick={handleLogout} title="Sign out">
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="db-main">
        {children}
      </main>
    </div>
  );
}

function IconOverview() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
    </svg>
  );
}

function IconModels() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="2" r="1.5" fill="currentColor"/>
      <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="14" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.5 9.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 11.5L13.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconUsage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L5.5 7.5L8.5 9.5L12 4L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10.5 5L14 8L10.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
