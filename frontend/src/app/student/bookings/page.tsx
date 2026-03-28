'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CalendarCheck, Plus } from 'lucide-react';

export default function StudentBookings() {
  const [resources, setResources] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ resourceId: '', date: '', startTime: '09:00', endTime: '10:00' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [resR, bookR] = await Promise.all([api.get('/resources'), api.get('/resources/bookings/my')]);
    setResources(resR.data);
    setMyBookings(bookR.data);
    if (resR.data.length > 0) setForm(f => ({ ...f, resourceId: resR.data[0].id }));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/resources/book', form);
      toast.success('Slot booked!');
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  const cancelBooking = async (id: string) => {
    try {
      await api.delete(`/resources/bookings/${id}`);
      toast.success('Booking cancelled');
      load();
    } catch { toast.error('Failed to cancel'); }
  };

  const statusClass: Record<string, string> = { CONFIRMED: 'badge-active', CANCELLED: 'badge-danger' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Resource Bookings</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> Book Slot</button>
        </div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Resource Bookings 📚</h1>
            <p>Book study rooms, gym slots, and laundry time</p>
          </div>

          <div className="grid-3" style={{ marginBottom: 24 }}>
            {resources.map((r: any) => (
              <div className="card" key={r.id}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>
                  {r.name.includes('Study') ? '📚' : r.name.includes('Gym') ? '💪' : '🧺'}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{r.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{r.description}</div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => { setForm(f => ({ ...f, resourceId: r.id })); setShowModal(true); }}>
                  Book Now
                </button>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">My Bookings</div></div>
            {myBookings.length === 0 ? (
              <div className="empty-state"><CalendarCheck size={40} /><h3>No bookings yet</h3></div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Resource</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {myBookings.map((b: any) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.resource?.name}</td>
                        <td>{b.date}</td>
                        <td>{b.startTime} – {b.endTime}</td>
                        <td><span className={`badge ${statusClass[b.status]}`}>{b.status}</span></td>
                        <td>
                          {b.status === 'CONFIRMED' && (
                            <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>Cancel</button>
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
              <h2 className="modal-title">Book a Resource Slot</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Resource</label>
                <select className="form-select" value={form.resourceId} onChange={e => setForm({ ...form, resourceId: e.target.value })}>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-input" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-input" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'Confirm Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
