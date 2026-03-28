'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Star } from 'lucide-react';

export default function MessPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  const load = async () => {
    try {
      const params = dateFilter ? `?date=${dateFilter}` : '';
      const res = await api.get(`/mess/menu${params}`);
      setMenus(res.data);
    } catch { toast.error('Failed to load menu'); }
  };

  useEffect(() => { load(); }, [dateFilter]);

  const submitFeedback = async (menuId: string) => {
    const rating = ratingMap[menuId];
    if (!rating) { toast.error('Select a rating first'); return; }
    setSubmitting(menuId);
    try {
      await api.post('/mess/feedback', { menuId, rating });
      toast.success('Thanks for your feedback!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(null); }
  };

  const mealIcon: Record<string, string> = { BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '☕' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Mess Menu</span>
          <input type="date" className="form-input" style={{ width: 'auto', padding: '6px 12px' }}
            value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Today's Mess Menu 🍽️</h1>
            <p>Rate your meals to help improve the service</p>
          </div>
          {menus.length === 0 ? (
            <div className="card empty-state"><UtensilsCrossed size={48} /><h3>No menu available</h3><p>Check back later</p></div>
          ) : (
            <div className="grid-auto">
              {menus.map((m: any) => (
                <div className="card" key={m.id}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{mealIcon[m.mealType] || '🍛'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="badge badge-info">{m.mealType}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.date}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {(m.items || []).map((item: string, i: number) => (
                      <span key={i} style={{ padding: '4px 10px', background: 'rgba(99,102,241,0.1)', borderRadius: '999px', fontSize: 12, color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.2)' }}>{item}</span>
                    ))}
                  </div>
                  <div className="divider" style={{ margin: '12px 0' }} />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Rate this meal:</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRatingMap(r => ({ ...r, [m.id]: star }))} style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 24,
                        color: (ratingMap[m.id] || 0) >= star ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                        transition: 'transform 0.1s', padding: 0,
                      }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>★</button>
                    ))}
                    {ratingMap[m.id] && <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 4 }}>{ratingMap[m.id]}/5</span>}
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => submitFeedback(m.id)} disabled={submitting === m.id}>
                    {submitting === m.id ? <span className="spinner" /> : <><Star size={14} /> Submit Rating</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
