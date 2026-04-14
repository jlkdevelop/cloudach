import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const InviteTeamModal = lazy(() => import('../../components/dashboard/InviteTeamModal'));

const ROLE_LABELS = {
  admin: 'Admin',
  developer: 'Developer',
  viewer: 'Viewer',
};

const ROLE_COLORS = {
  admin: { bg: '#EEF1FF', color: '#3730A3' },
  developer: { bg: '#ECFDF5', color: '#065F46' },
  viewer: { bg: '#F3F4F6', color: '#374151' },
};

/* Mock data — replace with real API call when backend supports it */
const MOCK_MEMBERS = [
  { id: '1', email: 'alice@acme.com', role: 'admin', joinedAt: '2026-01-10', status: 'active' },
  { id: '2', email: 'bob@acme.com', role: 'developer', joinedAt: '2026-02-03', status: 'active' },
  { id: '3', email: 'carol@acme.com', role: 'developer', joinedAt: '2026-03-15', status: 'active' },
  { id: '4', email: 'dave@acme.com', role: 'viewer', joinedAt: '2026-04-01', status: 'active' },
];

const MOCK_PENDING = [
  { id: 'p1', email: 'emma@acme.com', role: 'developer', invitedAt: '2026-04-12' },
];

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [pending, setPending] = useState(MOCK_PENDING);
  const [showInvite, setShowInvite] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [error] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.replace('/login'); return; }
        const { user: u } = await res.json();
        setUser(u);
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleInviteSent({ email, role }) {
    setPending(prev => [...prev, {
      id: `p${Date.now()}`, email, role,
      invitedAt: new Date().toISOString().split('T')[0],
    }]);
    setShowInvite(false);
    showToast(`Invite sent to ${email}`);
  }

  async function handleRemoveMember(id, email) {
    if (!confirm(`Remove ${email} from your team?`)) return;
    setRemovingId(id);
    // Simulate API call
    await new Promise(r => setTimeout(r, 600));
    setMembers(prev => prev.filter(m => m.id !== id));
    setRemovingId(null);
    showToast(`${email} removed from the team`);
  }

  async function handleRevokePending(id, email) {
    if (!confirm(`Revoke invite for ${email}?`)) return;
    setPending(prev => prev.filter(p => p.id !== id));
    showToast(`Invite revoked for ${email}`);
  }

  async function handleRoleChange(id, email, newRole) {
    setRoleUpdatingId(id);
    // Simulate API call
    await new Promise(r => setTimeout(r, 500));
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    setRoleUpdatingId(null);
    showToast(`${email} is now ${ROLE_LABELS[newRole]}`);
  }

  if (loading || !user) return <PageLoader />;

  const isAdmin = true; // In production: check user.role === 'admin'

  return (
    <>
      <Head><title>Team — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <div>
            <h1 className="db-page-title">Team</h1>
            <p className="db-page-subtitle">Manage members, roles, and pending invites</p>
          </div>
          {isAdmin && (
            <button
              className="db-btn db-btn--primary"
              onClick={() => setShowInvite(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Invite member
            </button>
          )}
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 300,
            background: toast.type === 'error' ? '#FEF2F2' : '#0D0F1A',
            border: toast.type === 'error' ? '1px solid #FECACA' : '1px solid #1E2235',
            borderRadius: 10, padding: '13px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            animation: 'fadeInUp 0.2s ease',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke={toast.type === 'error' ? '#DC2626' : '#34D399'} strokeWidth="1.3" />
              <path d="M4.5 7l1.5 1.5 3-3" stroke={toast.type === 'error' ? '#DC2626' : '#34D399'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13.5, color: toast.type === 'error' ? '#991B1B' : '#E2E8F0', fontWeight: 500 }}>
              {toast.message}
            </span>
          </div>
        )}

        {/* Members table */}
        <div className="db-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="db-card-header" style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
            <span className="db-card-title">
              Members
              <span style={{
                marginLeft: 8, fontSize: 11, fontWeight: 600,
                background: '#EEF1FF', color: '#3730A3',
                padding: '2px 8px', borderRadius: 99,
              }}>
                {members.length}
              </span>
            </span>
          </div>

          {members.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
              No members yet. Invite your first team member above.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  {['Member', 'Role', 'Joined', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: '#9CA3AF',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    {/* Email + avatar */}
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: '#EEF1FF', color: '#4F6EF7',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {m.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#0D0F1A' }}>{m.email}</div>
                          {m.email === user.email && (
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>You</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role selector */}
                    <td style={{ padding: '14px 24px' }}>
                      {isAdmin && m.email !== user.email ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <select
                            value={m.role}
                            disabled={roleUpdatingId === m.id}
                            onChange={e => handleRoleChange(m.id, m.email, e.target.value)}
                            style={{
                              fontSize: 12.5, fontWeight: 600,
                              padding: '4px 28px 4px 10px',
                              borderRadius: 6, border: 'none',
                              background: ROLE_COLORS[m.role]?.bg || '#F3F4F6',
                              color: ROLE_COLORS[m.role]?.color || '#374151',
                              cursor: 'pointer', appearance: 'none',
                              fontFamily: 'inherit',
                              opacity: roleUpdatingId === m.id ? 0.5 : 1,
                            }}
                          >
                            {Object.entries(ROLE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                          <svg
                            width="10" height="10" viewBox="0 0 10 10" fill="none"
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ROLE_COLORS[m.role]?.color || '#374151' }}
                          >
                            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: 12.5, fontWeight: 600,
                          padding: '4px 10px', borderRadius: 6,
                          background: ROLE_COLORS[m.role]?.bg || '#F3F4F6',
                          color: ROLE_COLORS[m.role]?.color || '#374151',
                        }}>
                          {ROLE_LABELS[m.role] || m.role}
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#9CA3AF' }}>
                      {new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      {isAdmin && m.email !== user.email && (
                        <button
                          onClick={() => handleRemoveMember(m.id, m.email)}
                          disabled={removingId === m.id}
                          style={{
                            fontSize: 12.5, color: '#DC2626', background: 'none',
                            border: '1px solid #FECACA', borderRadius: 6, padding: '5px 12px',
                            cursor: 'pointer', fontFamily: 'inherit',
                            opacity: removingId === m.id ? 0.5 : 1,
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {removingId === m.id ? 'Removing…' : 'Remove'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending invites */}
        {pending.length > 0 && (
          <div className="db-card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
            <div className="db-card-header" style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
              <span className="db-card-title">
                Pending invites
                <span style={{
                  marginLeft: 8, fontSize: 11, fontWeight: 600,
                  background: '#FEF3C7', color: '#92400E',
                  padding: '2px 8px', borderRadius: 99,
                }}>
                  {pending.length}
                </span>
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  {['Email', 'Role', 'Invited', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left', fontSize: 11,
                      fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: '#9CA3AF',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: '#F3F4F6', color: '#9CA3AF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {p.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#0D0F1A' }}>{p.email}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Invite pending</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        fontSize: 12.5, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 6,
                        background: ROLE_COLORS[p.role]?.bg || '#F3F4F6',
                        color: ROLE_COLORS[p.role]?.color || '#374151',
                      }}>
                        {ROLE_LABELS[p.role] || p.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#9CA3AF' }}>
                      {new Date(p.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => {/* resend logic */}}
                        style={{
                          fontSize: 12.5, color: '#4F6EF7', background: 'none',
                          border: '1px solid #D0D8FF', borderRadius: 6, padding: '5px 12px',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#EEF1FF'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => handleRevokePending(p.id, p.email)}
                        style={{
                          fontSize: 12.5, color: '#6B7280', background: 'none',
                          border: '1px solid #E5E7EB', borderRadius: 6, padding: '5px 12px',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Role guide */}
        <div className="db-card" style={{ marginTop: 20 }}>
          <div className="db-card-header">
            <span className="db-card-title">Role permissions</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Permission</th>
                  {['Admin', 'Developer', 'Viewer'].map(r => (
                    <th key={r} style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Deploy & manage models', true, true, false],
                  ['Create & revoke API keys', true, true, false],
                  ['View usage & logs', true, true, true],
                  ['Manage team members', true, false, false],
                  ['Manage billing', true, false, false],
                  ['View dashboard', true, true, true],
                ].map(([perm, admin, dev, viewer]) => (
                  <tr key={perm} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{perm}</td>
                    {[admin, dev, viewer].map((allowed, i) => (
                      <td key={i} style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {allowed ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                            <circle cx="8" cy="8" r="7" fill="#ECFDF5" />
                            <path d="M5 8l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                            <circle cx="8" cy="8" r="7" fill="#F3F4F6" />
                            <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite modal */}
        {showInvite && (
          <Suspense fallback={null}>
            <InviteTeamModal
              onClose={() => setShowInvite(false)}
              onInviteSent={handleInviteSent}
            />
          </Suspense>
        )}
      </DashboardLayout>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
