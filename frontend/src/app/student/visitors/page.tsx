'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Users, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StudentVisitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    visitorName: '',
    visitorPhone: '',
    purpose: '',
    expectedEntryTime: '',
    expectedExitTime: '',
  });

  const loadVisitors = async () => {
    try {
      const res = await api.get('/visitors/my');
      setVisitors(res.data);
    } catch {
      toast.error('Failed to load visitor requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVisitors(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/visitors/request', form);
      toast.success('Visitor request submitted! Waiting for approval.');
      setShowModal(false);
      setForm({ visitorName: '', visitorPhone: '', purpose: '', expectedEntryTime: '', expectedExitTime: '' });
      loadVisitors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  const statusClass: Record<string, string> = { PENDING: 'badge-pending', APPROVED: 'badge-active', REJECTED: 'badge-danger', COMPLETED: 'badge-resolved', EXPIRED: 'badge-high' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">My Visitor Requests</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Request
          </button>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Visitor Requests</h1>
            <p>Request permission for parents or guests to visit the hostel</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">My Requests History</div>
            </div>
            {visitors.length === 0 ? (
              <div className="empty-state">
                <Users size={40} />
                <h3>No requests yet</h3>
                <p>Click "New Request" to invite a visitor</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Visitor Name</th><th>Purpose</th><th>Expected Arrival</th><th>Status</th><th>QR Token</th></tr>
                  </thead>
                  <tbody>
                    {visitors.map((v: any) => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</td>
                        <td>{v.purpose}</td>
                        <td style={{ fontSize: 12 }}>{new Date(v.expectedEntryTime).toLocaleString()}</td>
                        <td><span className={`badge ${statusClass[v.status]}`}>{v.status}</span></td>
                        <td>
                          {v.status === 'APPROVED' ? (
                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{v.qrToken}</code>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Request Visitor Pass</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Visitor's Full Name</label>
                <input type="text" className="form-input" required placeholder="Guest name" value={form.visitorName} onChange={e => setForm({...form, visitorName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Visitor's Phone Number</label>
                <input type="tel" className="form-input" required placeholder="Phone number" value={form.visitorPhone} onChange={e => setForm({...form, visitorPhone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose of Visit</label>
                <input type="text" className="form-input" required placeholder="e.g. Parents visit, Local guardian" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Expected Arrival</label>
                  <input type="datetime-local" className="form-input" required value={form.expectedEntryTime} onChange={e => setForm({...form, expectedEntryTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Departure</label>
                  <input type="datetime-local" className="form-input" required value={form.expectedExitTime} onChange={e => setForm({...form, expectedExitTime: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
