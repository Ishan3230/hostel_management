'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, MessageSquare } from 'lucide-react';

const CATEGORIES = ['WATER', 'ELECTRICITY', 'INTERNET', 'FURNITURE', 'CLEANLINESS', 'OTHER'];
const priorityClass: Record<string, string> = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
const statusClass: Record<string, string> = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-info', RESOLVED: 'badge-resolved' };

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'WATER', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const res = await api.get('/complaints/my');
    setComplaints(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', form);
      toast.success('Complaint submitted!');
      setShowModal(false);
      setForm({ category: 'WATER', description: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">My Complaints</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> New Complaint</button>
        </div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>My Complaints</h1>
            <p>Track the status of your submitted complaints</p>
          </div>
          {complaints.length === 0 ? (
            <div className="card empty-state"><MessageSquare size={48} /><h3>No complaints yet</h3><p>Click "New Complaint" to raise an issue</p></div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Category</th><th>Description</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {complaints.map((c: any) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.category}</td>
                        <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</td>
                        <td><span className={`badge ${priorityClass[c.priority]}`}>{c.priority}</span></td>
                        <td><span className={`badge ${statusClass[c.status]}`}>{c.status.replace('_', ' ')}</span></td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Submit Complaint</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Priority: {form.category === 'WATER' || form.category === 'ELECTRICITY' ? '🔴 HIGH' : form.category === 'INTERNET' ? '🟡 MEDIUM' : '🟢 LOW'} (auto-detected)
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe your issue..." required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
