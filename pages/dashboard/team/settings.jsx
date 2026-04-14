import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../../components/dashboard/DashboardLayout';

export default function TeamSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit state
  const [name, setName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        const { user } = await meRes.json();
        setUser(user);

        const teamRes = await fetch('/api/dashboard/team');
        if (!teamRes.ok) { setError('Failed to load team.'); setLoading(false); return; }
        const { team: t } = await teamRes.json();

        if (!t) { router.replace('/dashboard/team'); return; }
        if (t.my_role !== 'admin') { router.replace('/dashboard/team'); return; }

        setTeam(t);
        setName(t.name || '');
        setBillingEmail(t.billing_contact_email || '');
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const res = await fetch('/api/dashboard/team/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, billing_contact_email: billingEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error || 'Failed to save settings.'); return; }
      setTeam(prev => ({ ...prev, ...data.team }));
      setSaveSuccess('Team settings saved.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>Team Settings — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Team Settings</h1>
          <p className="db-page-subtitle">Manage your team&apos;s name and billing contact.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {team && (
          <>
            <div className="db-card" style={{ marginBottom: 20 }}>
              <div className="db-card-header">
                <span className="db-card-title">General</span>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 440 }}>
                <div className="db-field">
                  <label className="db-label">Team name</label>
                  <input
                    className="db-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="db-field">
                  <label className="db-label">Billing contact email</label>
                  <input
                    className="db-input"
                    type="email"
                    value={billingEmail}
                    onChange={e => setBillingEmail(e.target.value)}
                    placeholder="billing@company.com"
                  />
                  <span className="db-field-hint">Invoices and billing notifications will be sent here.</span>
                </div>

                {saveError && <div className="db-field-error">{saveError}</div>}
                {saveSuccess && (
                  <div style={{
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534',
                  }}>
                    {saveSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="db-btn db-btn--primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" className="db-btn db-btn--ghost" onClick={() => router.push('/dashboard/team')}>
                    Back to team
                  </button>
                </div>
              </form>
            </div>

            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Team info</span>
              </div>
              <div className="db-settings-account-fields">
                <div className="db-settings-field">
                  <span className="db-settings-field-label">Team ID</span>
                  <span className="db-settings-field-value--mono">{team.id}</span>
                </div>
                <div className="db-settings-field">
                  <span className="db-settings-field-label">Created</span>
                  <span className="db-settings-field-value">
                    {new Date(team.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </>
  );
}
