'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';

interface InvitationItem {
  id: string;
  code: string;
  email?: string | null;
  role: string;
  status: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
}

interface UserItem {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  plan?: string | null;
  credits: number;
  revokedAt?: string | null;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  metadataJson: string;
  createdAt: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'invitations' | 'users' | 'audit'>('invitations');
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [actionFilter, setActionFilter] = useState('');

  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState('USER');
  const [newInviteHours, setNewInviteHours] = useState(72);
  const [newInviteMaxUses, setNewInviteMaxUses] = useState(1);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  async function loadAll(filterAction = actionFilter) {
    try {
      const [invRes, usrRes, audRes] = await Promise.all([
        fetch('/api/admin/invitations'),
        fetch('/api/admin/users'),
        fetch(
          `/api/admin/audit-logs${filterAction ? `?action=${encodeURIComponent(filterAction)}` : ''}`
        ),
      ]);

      if (invRes.status === 401 || invRes.status === 403) {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      const [invData, usrData, audData] = await Promise.all([
        invRes.json(),
        usrRes.json(),
        audRes.json(),
      ]);

      setInvitations(invData.invitations || []);
      setUsers(usrData.users || []);
      setAuditLogs(audData.logs || []);
    } catch {
      setAuthorized(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setStatusBanner(null);
    setErrorBanner(null);
    const res = await fetch('/api/admin/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newInviteEmail.trim() || null,
        role: newInviteRole,
        expiresInHours: Number(newInviteHours),
        maxUses: Number(newInviteMaxUses),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorBanner(data.error || 'Failed to create invitation code.');
    } else {
      setStatusBanner(`Created single-use/expiring invitation code: ${data.invitation.code}`);
      setNewInviteEmail('');
      await loadAll();
    }
  }

  async function handleRevokeInvite(id: string) {
    setStatusBanner(null);
    setErrorBanner(null);
    const res = await fetch('/api/admin/invitations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'revoke' }),
    });
    if (res.ok) {
      setStatusBanner('Invitation code revoked.');
      await loadAll();
    }
  }

  async function handleUpdateUser(
    userId: string,
    payload: { action?: 'revoke' | 'restore'; role?: string }
  ) {
    setStatusBanner(null);
    setErrorBanner(null);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorBanner(data.error || 'Failed to update user.');
    } else {
      setStatusBanner(`Updated user ${data.user.email}.`);
      await loadAll();
    }
  }

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '48px 24px 80px' }}>
        <span className="rl-eyebrow">SECURITY & GOVERNANCE CONSOLE</span>
        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '12px' }}>
          Invitation Codes, RBAC Roles & Audit Logs
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px', marginBottom: '28px' }}>
          Manage single-use and expiring invitation codes, assign roles (ADMIN, AGENT,
          BUILDER, USER), immediately revoke user sessions, and inspect the immutable
          security audit log.
        </p>

        {authorized === false ? (
          <div className="rl-card" role="alert">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
              Administrator access required
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              You must be signed in with an active <strong>ADMIN</strong> account to access
              the governance console.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/account" className="rl-btn rl-btn-primary">
                Sign in on Account page
              </Link>
              <Link href="/signup" className="rl-btn rl-btn-secondary">
                Bootstrap Admin / Sign up
              </Link>
            </div>
          </div>
        ) : authorized === null ? (
          <p>Loading governance console...</p>
        ) : (
          <>
            {statusBanner && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#EDF5F0',
                  border: '1px solid #A3C6B1',
                  color: '#204B32',
                  marginBottom: '20px',
                }}
              >
                {statusBanner}
              </div>
            )}
            {errorBanner && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#FDF2F0',
                  border: '1px solid #E5A99C',
                  color: '#8E2B18',
                  marginBottom: '20px',
                }}
              >
                {errorBanner}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`rl-btn ${tab === 'invitations' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                onClick={() => {
                  setTab('invitations');
                  loadAll();
                }}
              >
                Invitation Codes ({invitations.length})
              </button>
              <button
                type="button"
                className={`rl-btn ${tab === 'users' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                onClick={() => {
                  setTab('users');
                  loadAll();
                }}
              >
                Users & Roles ({users.length})
              </button>
              <button
                type="button"
                className={`rl-btn ${tab === 'audit' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                onClick={() => {
                  setTab('audit');
                  loadAll();
                }}
              >
                Audit Logs ({auditLogs.length})
              </button>
            </div>

            {tab === 'invitations' && (
              <div style={{ display: 'grid', gap: '24px' }}>
                <div className="rl-card">
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>
                    Issue new invitation code
                  </h2>
                  <form
                    onSubmit={handleCreateInvite}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '14px',
                      alignItems: 'end',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                        Lock to Email (optional)
                      </label>
                      <input
                        type="email"
                        className="rl-input"
                        placeholder="any@email.com"
                        value={newInviteEmail}
                        onChange={e => setNewInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                        Assigned Role
                      </label>
                      <select
                        aria-label="Assigned Role"
                        className="rl-input"
                        value={newInviteRole}
                        onChange={e => setNewInviteRole(e.target.value)}
                      >
                        <option value="USER">USER (Homeowner)</option>
                        <option value="BUILDER">BUILDER</option>
                        <option value="AGENT">AGENT (Real Estate)</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                        Expires in (hours)
                      </label>
                      <input
                        type="number"
                        className="rl-input"
                        min={1}
                        max={8760}
                        value={newInviteHours}
                        onChange={e => setNewInviteHours(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                        Max uses (1 = single-use)
                      </label>
                      <input
                        type="number"
                        className="rl-input"
                        min={1}
                        max={100}
                        value={newInviteMaxUses}
                        onChange={e => setNewInviteMaxUses(Number(e.target.value))}
                      />
                    </div>
                    <button type="submit" className="rl-btn rl-btn-primary">
                      Generate Code
                    </button>
                  </form>
                </div>

                <div className="rl-card" style={{ overflowX: 'auto' }}>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>
                    Issued invitation codes
                  </h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-sand)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 8px' }}>Code</th>
                        <th style={{ padding: '10px 8px' }}>Role</th>
                        <th style={{ padding: '10px 8px' }}>Target Email</th>
                        <th style={{ padding: '10px 8px' }}>Status</th>
                        <th style={{ padding: '10px 8px' }}>Uses</th>
                        <th style={{ padding: '10px 8px' }}>Expires</th>
                        <th style={{ padding: '10px 8px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-sand)' }}>
                          <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {inv.code}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span className="rl-badge">{inv.role}</span>
                          </td>
                          <td style={{ padding: '10px 8px' }}>{inv.email || 'Any'}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <span className="rl-badge">{inv.status}</span>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            {inv.usedCount} / {inv.maxUses}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            {new Date(inv.expiresAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            {inv.status === 'ACTIVE' && (
                              <button
                                type="button"
                                className="rl-btn rl-btn-secondary"
                                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                                onClick={() => handleRevokeInvite(inv.id)}
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="rl-card" style={{ overflowX: 'auto' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>
                  Registered Users, Roles & Access Revocation
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-sand)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px' }}>Email</th>
                      <th style={{ padding: '10px 8px' }}>Role</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                      <th style={{ padding: '10px 8px' }}>Plan</th>
                      <th style={{ padding: '10px 8px' }}>Credits</th>
                      <th style={{ padding: '10px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-sand)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 500 }}>{u.email}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <select
                            aria-label={`Role for ${u.email}`}
                            className="rl-input"
                            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
                            value={u.role}
                            onChange={e => handleUpdateUser(u.id, { role: e.target.value })}
                          >
                            <option value="USER">USER</option>
                            <option value="BUILDER">BUILDER</option>
                            <option value="AGENT">AGENT</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className="rl-badge">{u.status}</span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>{u.plan || '—'}</td>
                        <td style={{ padding: '10px 8px' }}>{u.credits}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {u.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              className="rl-btn rl-btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleUpdateUser(u.id, { action: 'revoke' })}
                            >
                              Revoke User
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="rl-btn rl-btn-primary"
                              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleUpdateUser(u.id, { action: 'restore' })}
                            >
                              Restore User
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'audit' && (
              <div className="rl-card" style={{ overflowX: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <h2 style={{ fontSize: '1.3rem' }}>Immutable Security Audit Trail</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="rl-input"
                      placeholder="Filter by action (e.g. USER_REGISTERED)"
                      value={actionFilter}
                      onChange={e => setActionFilter(e.target.value)}
                      style={{ width: '260px' }}
                    />
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      onClick={() => loadAll(actionFilter)}
                    >
                      Filter
                    </button>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-sand)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px' }}>Timestamp</th>
                      <th style={{ padding: '10px 8px' }}>Action</th>
                      <th style={{ padding: '10px 8px' }}>Actor</th>
                      <th style={{ padding: '10px 8px' }}>Target</th>
                      <th style={{ padding: '10px 8px' }}>Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-sand)' }}>
                        <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className="rl-badge">{log.action}</span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>{log.actorEmail || 'system'}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {log.targetType ? `${log.targetType}:${log.targetId || ''}` : '—'}
                        </td>
                        <td
                          style={{
                            padding: '10px 8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            maxWidth: '320px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {log.metadataJson}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </SiteChrome>
  );
}
