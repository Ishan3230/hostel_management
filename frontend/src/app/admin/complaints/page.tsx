'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const CATEGORIES = ['WATER', 'ELECTRICITY', 'INTERNET', 'FURNITURE', 'CLEANLINESS', 'OTHER'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
const priorityClass: Record<string, string> = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
const statusClass: Record<string, string> = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-info', RESOLVED: 'badge-resolved' };

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [filter, setFilter] = useState({ status: '', priority: '', category: '' });

  const load = async () => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.priority) params.set('priority', filter.priority);
    if (filter.category) params.set('category', filter.category);
    const [compR, anaR] = await Promise.all([
      api.get(`/complaints?${params.toString()}`),
      api.get('/complaints/analytics'),
    ]);
    setComplaints(compR.data);
    setAnalytics(anaR.data);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar"><span className="topbar-title">Complaint Management</span></div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Complaint Management 📋</h1>
            <p>Manage and resolve student complaints</p>
          </div>

          {analytics && (
            <div className="grid-3" style={{ marginBottom: 24 }}>
              {(analytics.byStatus || []).map((s: any) => (
                <div className="stat-card" key={s.status}>
                  <div className={`stat-icon ${s.status === 'PENDING' ? 'amber' : s.status === 'RESOLVED' ? 'green' : 'blue'}`}>
                    {s.status === 'RESOLVED' ? <CheckCircle size={22} /> : <XCircle size={22} />}
                  </div>
                  <div><div className="stat-value">{s.count}</div><div className="stat-label">{s.status?.replace('_', ' ')}</div></div>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
              {[['Status', 'status', ['', ...STATUSES]], ['Priority', 'priority', ['', 'HIGH', 'MEDIUM', 'LOW']], ['Category', 'category', ['', ...CATEGORIES]]].map(([label, key, opts]) => (
                <div key={key as string} style={{ flex: 1, minWidth: 150 }}>
                  <label className="form-label">{label as string}</label>
                  <select className="form-select" value={(filter as any)[key as string]} onChange={e => setFilter(f => ({ ...f, [key as string]: e.target.value }))}>
                    {(opts as string[]).map(o => <option key={o} value={o}>{o || `All ${label}s`}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Student</th><th>Category</th><th>Description</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {complaints.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.student?.name || '—'}</td>
                      <td>{c.category}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
                      <td><span className={`badge ${priorityClass[c.priority]}`}>{c.priority}</span></td>
                      <td><span className={`badge ${statusClass[c.status]}`}>{c.status.replace('_', ' ')}</span></td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {c.status !== 'IN_PROGRESS' && c.status !== 'RESOLVED' && (
                            <button className="btn btn-sm" style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}
                              onClick={() => updateStatus(c.id, 'IN_PROGRESS')}>Start</button>
                          )}
                          {c.status !== 'RESOLVED' && (
                            <button className="btn btn-sm btn-success" onClick={() => updateStatus(c.id, 'RESOLVED')}>Resolve</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
