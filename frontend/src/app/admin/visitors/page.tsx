'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, CheckCircle, XCircle, Search, Clock, Calendar } from 'lucide-react';

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadVisitors = async () => {
    try {
      const res = await api.get('/visitors');
      setVisitors(res.data);
    } catch {
      toast.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVisitors(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/visitors/${id}/status`, { status });
      toast.success(`Visitor status updated to ${status}`);
      loadVisitors();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = visitors.filter(v =>
    v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    (v.student?.name && v.student.name.toLowerCase().includes(search.toLowerCase()))
  );

  const statusClass: Record<string, string> = { PENDING: 'badge-pending', APPROVED: 'badge-active', REJECTED: 'badge-danger', COMPLETED: 'badge-resolved', EXPIRED: 'badge-high' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Visitor Management</span>
          <div className="topbar-actions" style={{ width: 250 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" className="form-input" placeholder="Search visitor/student..." style={{ paddingLeft: 30, fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Visitor Oversight 👥</h1>
            <p>Review and manage visitor requests from students</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">All Visitor Passes</div>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Users size={40} />
                <h3>No visitors found</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Visitor</th><th>Student (Resident)</th><th>Purpose</th><th>Expected Date/Time</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((v: any) => (
                      <tr key={v.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                          <div style={{ fontSize: 11 }}>{v.visitorPhone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{v.student?.name}</div>
                          <div style={{ fontSize: 11 }}>{v.student?.studentId}</div>
                        </td>
                        <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.purpose}</td>
                        <td style={{ fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> {v.expectedEntryTime.split('T')[0]}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {v.expectedEntryTime.split('T')[1]?.substring(0, 5)}</div>
                        </td>
                        <td><span className={`badge ${statusClass[v.status]}`}>{v.status}</span></td>
                        <td>
                          {v.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" style={{ padding: '4px 8px' }} onClick={() => updateStatus(v.id, 'APPROVED')}>Approve</button>
                              <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => updateStatus(v.id, 'REJECTED')}>Reject</button>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No actions</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
