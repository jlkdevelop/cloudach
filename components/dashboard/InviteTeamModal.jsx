import { useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', desc: 'Full access — can manage billing, members, and all resources' },
  { value: 'developer', label: 'Developer', desc: 'Can create API keys, deploy models, and view usage' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access to dashboard, usage, and models' },
];

export default function InviteTeamModal({ onClose, onInviteSent }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.'); return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to send invite. Please try again.');
        setLoading(false);
        return;
      }

      setSent(true);
      if (onInviteSent) onInviteSent({ email: email.trim(), role });
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 200, backdropFilter: 'blur(2px)',
        }}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: '100%', maxWidth: 480,
          padding: '36px 36px 32px',
        }}
      >
        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D0F1A', marginBottom: 10 }}>Invite sent</h2>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, marginBottom: 28 }}>
              An invitation was sent to <strong style={{ color: '#0D0F1A' }}>{email}</strong> as <strong style={{ color: '#0D0F1A' }}>{ROLE_OPTIONS.find(r => r.value === role)?.label}</strong>.
              They'll receive an email with a link to join your workspace.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => { setEmail(''); setRole('developer'); setSent(false); setError(''); }}
                style={{
                  padding: '10px 22px', fontSize: 14, fontWeight: 600,
                  background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Invite another
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 22px', fontSize: 14, fontWeight: 500,
                  background: 'transparent', color: '#6B7280',
                  border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h2 id="invite-modal-title" style={{ fontSize: 19, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.4 }}>
                  Invite team member
                </h2>
                <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 5 }}>
                  They'll get an email with a link to join your workspace.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                  padding: 4, marginTop: -4, marginRight: -4, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
                padding: '11px 14px', marginBottom: 20, color: '#991B1B', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.3" />
                  <path d="M7 4.5v3M7 9.5h.01" stroke="#DC2626" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 14,
                    border: '1px solid #D1D5DB', borderRadius: 8,
                    outline: 'none', color: '#0D0F1A',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4F6EF7'; }}
                  onBlur={e => { e.target.style.borderColor = '#D1D5DB'; }}
                />
              </div>

              {/* Role */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                  Role
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ROLE_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '12px 14px', borderRadius: 9, cursor: 'pointer',
                        border: role === opt.value ? '2px solid #4F6EF7' : '1px solid #E5E7EB',
                        background: role === opt.value ? '#F5F7FF' : '#fff',
                        transition: 'border-color 0.15s, background 0.15s',
                        marginTop: role === opt.value ? 0 : 1,
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={role === opt.value}
                        onChange={() => setRole(opt.value)}
                        style={{ marginTop: 2, accentColor: '#4F6EF7', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0D0F1A' }}>{opt.label}</div>
                        <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2, lineHeight: 1.5 }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px', fontSize: 14, fontWeight: 500,
                    background: 'transparent', color: '#6B7280',
                    border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px', fontSize: 14, fontWeight: 600,
                    background: loading ? '#A5B4FC' : '#4F6EF7',
                    color: '#fff', border: 'none', borderRadius: 8,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {loading && (
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
                      animation: 'invite-spin 0.6s linear infinite',
                    }} />
                  )}
                  {loading ? 'Sending…' : 'Send invite'}
                </button>
              </div>
            </form>
          </>
        )}
        <style>{`@keyframes invite-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}
