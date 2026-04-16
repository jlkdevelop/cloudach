import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from '../Logo';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: IconOverview },
  { href: '/dashboard/models', label: 'Models', icon: IconModels },
  { href: '/dashboard/playground', label: 'Playground', icon: IconPlayground },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: IconKey },
  { href: '/dashboard/usage', label: 'Usage', icon: IconUsage },
  { href: '/dashboard/logs', label: 'Request Logs', icon: IconLogs },
  { href: '/dashboard/alerts', label: 'Alerts', icon: IconAlerts },
  { href: '/dashboard/billing', label: 'Billing', icon: IconBilling },
  { href: '/dashboard/team', label: 'Team', icon: IconTeam },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: IconWebhooks },
  { href: '/dashboard/audit-log', label: 'Audit Log', icon: IconAuditLog },
  { href: '/dashboard/settings', label: 'Settings', icon: IconSettings },
];

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '3px solid #E5E7EB', borderTopColor: '#4F6EF7',
          animation: 'db-spin 0.7s linear infinite', margin: '0 auto 12px'
        }} />
        <div style={{ fontSize: 13 }}>Loading…</div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }) {
  return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
      padding: '14px 18px', marginBottom: 24, color: '#991B1B', fontSize: 13.5,
      display: 'flex', alignItems: 'center', gap: 10
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" stroke="#DC2626" strokeWidth="1.5"/>
        <path d="M8 5v3.5M8 11h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {message || 'Something went wrong. Please refresh the page.'}
    </div>
  );
}

export default function DashboardLayout({ children, user }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const sidebar = (
    <aside className={`db-sidebar${sidebarOpen ? ' db-sidebar--open' : ''}`}>
      <div className="db-sidebar-logo">
        <Logo size={22} monochrome />
        <span className="db-sidebar-brand">cloud<span>ach</span></span>
        <button
          className="db-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <nav className="db-nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? router.pathname === href
            : router.pathname === href || router.pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`db-nav-item${active ? ' db-nav-item--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
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
          <span className="db-user-email" title={user?.email}>{user?.email || 'User'}</span>
        </div>
        <button className="db-logout-btn" onClick={handleLogout} title="Sign out">
          <IconLogout />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="db-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="db-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {sidebar}

      {/* Main content */}
      <main className="db-main">
        {/* Mobile top bar */}
        <div className="db-mobile-topbar">
          <button
            className="db-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="db-mobile-brand">cloud<span>ach</span></span>
        </div>
        {children}
      </main>

      <style>{`
        @keyframes db-spin { to { transform: rotate(360deg); } }
        @keyframes pg-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
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

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 13c0-2.485 2.015-4.5 4.5-4.5S10 10.515 10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 8.5c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconAlerts() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2a5 5 0 00-5 5v3l-1 2h12l-1-2V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 2V1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconWebhooks() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 8a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 6c1.5 0 2.5.8 2.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M4 8c-1.2.4-2 1.4-2 2.5 0 1.4 1.1 2.5 2.5 2.5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconLogs() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 6h3M4 9h5M4 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="11" cy="6" r="1" fill="currentColor" opacity="0.7"/>
      <circle cx="11" cy="9" r="1" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function IconAuditLog() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 5h6M5 8h4M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconBilling() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="3" y="9.5" width="3" height="1.5" rx="0.5" fill="currentColor" opacity="0.7"/>
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

function IconPlayground() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M4 14h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
