'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Plus, Trash2, PieChart, Star } from 'lucide-react';

export default function AdminMess() {
  const [menus, setMenus] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], mealType: 'BREAKFAST', items: '' });

  const loadData = async () => {
    try {
      const [menuRes, analyticsRes] = await Promise.all([
        api.get('/mess/menu'),
        api.get('/mess/analytics'),
      ]);
      setMenus(menuRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
      toast.error('Failed to load mess data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/mess/menu', {
        ...form,
        items: form.items.split(',').map(i => i.trim()).filter(i => i),
      });
      toast.success('Menu uploaded successfully');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const mealColors: Record<string, string> = { BREAKFAST: 'blue', LUNCH: 'amber', DINNER: 'cyan', SNACK: 'green' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Mess Management</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Upload Menu
          </button>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Mess & Catering</h1>
            <p>Manage daily menus and monitor student feedback</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon amber"><UtensilsCrossed size={22} /></div>
              <div>
                <div className="stat-value">{menus.length}</div>
                <div className="stat-label">Total Menus</div>
              </div>
            </div>
            {analytics?.averageRatings?.slice(0, 3).map((r: any) => (
              <div className="stat-card" key={r.mealType}>
                <div className={`stat-icon ${mealColors[r.mealType]}`}><Star size={22} /></div>
                <div>
                  <div className="stat-value">{Number(r.averageRating).toFixed(1)}</div>
                  <div className="stat-label">{r.mealType} Rating</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Menus</div>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Date</th><th>Meal</th><th>Items</th><th>Rating</th></tr>
                </thead>
                <tbody>
                  {menus.map((m: any) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.date}</td>
                      <td><span className={`badge badge-${mealColors[m.mealType]}`}>{m.mealType}</span></td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.items.join(', ')}</td>
                      <td>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                          ★ {analytics?.averageRatings?.find((r: any) => r.mealType === m.mealType)?.averageRating || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Upload Daily Menu</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <select className="form-select" value={form.mealType} onChange={e => setForm({...form, mealType: e.target.value})}>
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="SNACK">Snack</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Menu Items (comma separated)</label>
                <textarea className="form-textarea" required placeholder="Puri Sabji, Tea, Banana..." value={form.items} onChange={e => setForm({...form, items: e.target.value})} />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
