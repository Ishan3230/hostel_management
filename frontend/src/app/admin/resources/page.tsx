'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Calendar, Clock, Trash2, CheckCircle } from 'lucide-react';

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', description: '', type: 'STUDY_ROOM' });

  const loadData = async () => {
    try {
      const [resRes, bookRes] = await Promise.all([
        api.get('/resources'),
        api.get('/resources/bookings'), // Assuming admin can see all bookings
      ]);
      setResources(resRes.data);
      setBookings(bookRes.data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/resources', form);
      toast.success('Resource created successfully');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const statusClass: Record<string, string> = { CONFIRMED: 'badge-active', CANCELLED: 'badge-danger' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Resource Management</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Resource
          </button>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Hostel Resources</h1>
            <p>Manage bookable hostel facilities and monitor reservations</p>
          </div>

          <div className="grid-2">
            {/* Resources List */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Available Resources</div>
              </div>
              <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {resources.map((r: any) => (
                  <div key={r.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{r.name.includes('Study') ? '📚' : r.name.includes('Gym') ? '💪' : '🧺'}</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{r.type.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookings table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Bookings</div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Student</th><th>Resource</th><th>Time</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((b: any) => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--text-primary)' }}>{b.student?.name}</td>
                        <td>{b.resource?.name}</td>
                        <td style={{ fontSize: 12 }}>{b.date} <br/> {b.startTime}-{b.endTime}</td>
                        <td><span className={`badge ${statusClass[b.status]}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Hostel Resource</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Resource Name</label>
                <input type="text" className="form-input" required placeholder="Study Room 101" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="STUDY_ROOM">Study Room</option>
                  <option value="GYM">Gym</option>
                  <option value="LAUNDRY">Laundry</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" required placeholder="Location, capacity, or rules..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
