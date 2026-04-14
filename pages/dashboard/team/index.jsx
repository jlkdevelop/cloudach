import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../../components/dashboard/DashboardLayout';

const ROLE_LABELS = { admin: 'Admin', member: 'Member', viewer: 'Viewer' };
const ROLE_COLORS = { admin: '#4F6EF7', member: '#10B981', viewer: '#F59E0B' };

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create team form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Role change / remove
  const [savingRole, setSavingRole] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);

  const myRole = team?.my_role;
  const isAdmin = myRole === 'admin';

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
        setTeam(t);

        if (t) {
          const [membersRes, invitesRes, usageRes] = await Promise.all([
            fetch('/api/dashboard/team/members'),
            t.my_role === 'admin' ? fetch('/api/dashboard/team/invites') : Promise.resolve(null),
            fetch('/api/dashboard/team/usage'),
          ]);
          if (membersRes.ok) setMembers((await membersRes.json()).members || []);
          if (invitesRes?.ok) setInvites((await invitesRes.json()).invites || []);
          if (usageRes.ok) setUsage(await usageRes.json());
        }
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleCreateTeam(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/dashboard/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || 'Failed to create team.'); return; }
      setTeam(data.team);
      setMembers([]);
      setShowCreate(false);
      setCreateName('');
      // Reload members and usage
      const [membersRes, usageRes] = await Promise.all([
        fetch('/api/dashboard/team/members'),
        fetch('/api/dashboard/team/usage'),
      ]);
      if (membersRes.ok) setMembers((await membersRes.json()).members || []);
      if (usageRes.ok) setUsage(await usageRes.json());
    } catch {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await fetch('/api/dashboard/team/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error || 'Failed to send invite.'); return; }
      setInvites(prev => [data.invite, ...prev]);
      setInviteSuccess(`Invite sent to ${inviteEmail}. Link: ${data.inviteUrl}`);
      setInviteEmail('');
      setInviteRole('member');
    } catch {
      setInviteError('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(memberId, newRole) {
    setSavingRole(memberId);
    try {
      const res = await fetch(`/api/dashboard/team/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to update role.'); return; }
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: data.member.role } : m));
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSavingRole(null);
    }
  }

  async function handleRemoveMember(memberId, email) {
    if (!confirm(`Remove ${email} from the team?`)) return;
    setRemovingMember(memberId);
    try {
      const res = await fetch(`/api/dashboard/team/members/${memberId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to remove member.'); return; }
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setRemovingMember(null);
    }
  }

  async function handleRevokeInvite(inviteId) {
    try {
      const res = await fetch(`/api/dashboard/team/invites/${inviteId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to revoke invite.'); return; }
      setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, revoked_at: new Date().toISOString() } : i));
    } catch {
      alert('Network error. Please try again.');
    }
  }

  if (loading || !user) return <PageLoader />;

  const pendingInvites = invites.filter(i => !i.accepted_at && !i.revoked_at && new Date(i.expires_at) > new Date());

  return (
    <>
      <Head><title>Team — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Team</h1>
          <p className="db-page-subtitle">
            {team ? `${team.name} · ${ROLE_LABELS[myRole] || myRole}` : 'Manage your team and collaborate with teammates.'}
          </p>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* No team — create or wait for invite */}
        {!team && (
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">No team yet</span>
            </div>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
              You are not part of a team. Create a new team to collaborate with your colleagues, or ask a teammate to send you an invite.
            </p>
            {!showCreate ? (
              <button className="db-btn db-btn--primary" onClick={() => setShowCreate(true)}>
                Create a team
              </button>
            ) : (
              <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
                <div className="db-field">
                  <label className="db-label">Team name</label>
                  <input
                    className="db-input"
                    placeholder="Acme Inc."
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {createError && <div className="db-field-error">{createError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="db-btn db-btn--primary" disabled={creating}>
                    {creating ? 'Creating…' : 'Create team'}
                  </button>
                  <button type="button" className="db-btn db-btn--ghost" onClick={() => { setShowCreate(false); setCreateError(''); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Team exists */}
        {team && (
          <>
            {/* Usage summary */}
            {usage && (
              <div className="db-stats-grid" style={{ marginBottom: 24 }}>
                <StatCard label="Team tokens this month" value={formatTokens(usage.total.tokens)} sub="All members combined" />
                <StatCard label="Team requests this month" value={usage.total.requests?.toLocaleString()} sub="All members combined" />
                <StatCard label="Est. team cost this month" value={formatCost(usage.total.estimated_cost)} sub="Across all members" />
                <StatCard label="Members" value={members.length} sub={`${pendingInvites.length} invite${pendingInvites.length !== 1 ? 's' : ''} pending`} />
              </div>
            )}

            {/* Members list */}
            <div className="db-card" style={{ marginBottom: 20 }}>
              <div className="db-card-header">
                <span className="db-card-title">Members</span>
                {isAdmin && (
                  <Link href="/dashboard/team/settings">
                    <button className="db-btn db-btn--ghost db-btn--sm">Team settings</button>
                  </Link>
                )}
              </div>
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id}>
                        <td>
                          {m.email}
                          {m.user_id === user.id && (
                            <span style={{ marginLeft: 6, fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>(you)</span>
                          )}
                          {m.user_id === team.owner_user_id && (
                            <span style={{ marginLeft: 6, fontSize: 11, color: '#4F6EF7', fontWeight: 600 }}>owner</span>
                          )}
                        </td>
                        <td>
                          {isAdmin && m.user_id !== team.owner_user_id ? (
                            <select
                              className="db-select db-select--sm"
                              value={m.role}
                              disabled={savingRole === m.id}
                              onChange={e => handleRoleChange(m.id, e.target.value)}
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          ) : (
                            <span className="db-role-badge" style={{ '--role-color': ROLE_COLORS[m.role] }}>
                              {ROLE_LABELS[m.role] || m.role}
                            </span>
                          )}
                        </td>
                        <td style={{ color: '#9CA3AF', fontSize: 13 }}>
                          {new Date(m.joined_at).toLocaleDateString()}
                        </td>
                        {isAdmin && (
                          <td>
                            {m.user_id !== team.owner_user_id && m.user_id !== user.id && (
                              <button
                                className="db-btn db-btn--danger db-btn--sm"
                                disabled={removingMember === m.id}
                                onClick={() => handleRemoveMember(m.id, m.email)}
                              >
                                {removingMember === m.id ? 'Removing…' : 'Remove'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Per-member usage breakdown */}
            {usage && usage.byMember.length > 0 && (
              <div className="db-card" style={{ marginBottom: 20 }}>
                <div className="db-card-header">
                  <span className="db-card-title">Usage by member this month</span>
                </div>
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Tokens</th>
                        <th>Requests</th>
                        <th>Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.byMember.map(m => (
                        <tr key={m.user_id}>
                          <td>{m.email}{m.user_id === user.id && <span style={{ marginLeft: 6, fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>(you)</span>}</td>
                          <td>{formatTokens(m.total_tokens)}</td>
                          <td>{m.total_requests?.toLocaleString()}</td>
                          <td>{formatCost(m.estimated_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invite form — admin only */}
            {isAdmin && (
              <div className="db-card" style={{ marginBottom: 20 }}>
                <div className="db-card-header">
                  <span className="db-card-title">Invite a teammate</span>
                </div>
                <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="db-field" style={{ flex: '1 1 240px' }}>
                    <label className="db-label">Email address</label>
                    <input
                      className="db-input"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="db-field" style={{ minWidth: 130 }}>
                    <label className="db-label">Role</label>
                    <select className="db-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                      <option value="admin">Admin — full access</option>
                      <option value="member">Member — API keys only</option>
                      <option value="viewer">Viewer — read only</option>
                    </select>
                  </div>
                  <button type="submit" className="db-btn db-btn--primary" disabled={inviting} style={{ marginBottom: 0 }}>
                    {inviting ? 'Sending…' : 'Send invite'}
                  </button>
                </form>
                {inviteError && <div className="db-field-error" style={{ marginTop: 10 }}>{inviteError}</div>}
                {inviteSuccess && (
                  <div style={{
                    marginTop: 12, background: '#F0FDF4', border: '1px solid #BBF7D0',
                    borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#166534',
                    wordBreak: 'break-all',
                  }}>
                    {inviteSuccess}
                  </div>
                )}
              </div>
            )}

            {/* Pending invites — admin only */}
            {isAdmin && pendingInvites.length > 0 && (
              <div className="db-card">
                <div className="db-card-header">
                  <span className="db-card-title">Pending invites</span>
                  <span className="db-badge">{pendingInvites.length}</span>
                </div>
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Expires</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingInvites.map(inv => (
                        <tr key={inv.id}>
                          <td>{inv.email}</td>
                          <td>
                            <span className="db-role-badge" style={{ '--role-color': ROLE_COLORS[inv.role] }}>
                              {ROLE_LABELS[inv.role] || inv.role}
                            </span>
                          </td>
                          <td style={{ color: '#9CA3AF', fontSize: 13 }}>
                            {new Date(inv.expires_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="db-btn db-btn--ghost db-btn--sm"
                              onClick={() => handleRevokeInvite(inv.id)}
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">{label}</div>
      <div className="db-stat-value">{value ?? '—'}</div>
      {sub && <div className="db-stat-sub">{sub}</div>}
    </div>
  );
}

function formatTokens(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  return `$${n.toFixed(2)}`;
}
