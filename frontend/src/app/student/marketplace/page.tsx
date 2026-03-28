'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, ShoppingBag, Trash2 } from 'lucide-react';

const CATEGORIES = ['BOOKS', 'ELECTRONICS', 'CYCLES', 'CLOTHING', 'FURNITURE', 'OTHER'];

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'BOOKS' });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await api.get('/marketplace');
      setListings(res.data);
    } catch { toast.error('Failed to load listings'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/marketplace', { ...form, price: Number(form.price) });
      toast.success('Listing created!');
      setShowModal(false);
      setForm({ title: '', description: '', price: '', category: 'BOOKS' });
      loadListings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this listing?')) return;
    try {
      await api.delete(`/marketplace/${id}`);
      toast.success('Listing removed');
      loadListings();
    } catch { toast.error('Failed to remove listing'); }
  };

  const catColors: Record<string, string> = {
    BOOKS: 'badge-info', ELECTRONICS: 'badge-high', CYCLES: 'badge-active',
    CLOTHING: 'badge-medium', FURNITURE: 'badge-pending', OTHER: 'badge-resolved',
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Hostel Marketplace</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> List Item</button>
        </div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Hostel Marketplace 🛒</h1>
            <p>Buy and sell items with fellow hostel students</p>
          </div>

          {listings.length === 0 ? (
            <div className="card empty-state"><ShoppingBag size={48} /><h3>No listings yet</h3><p>Be the first to list an item!</p></div>
          ) : (
            <div className="grid-auto">
              {listings.map((l: any) => (
                <div className="card" key={l.id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span className={`badge ${catColors[l.category] || 'badge-info'}`}>{l.category}</span>
                    {user?.id === l.sellerId && (
                      <button className="btn btn-sm" style={{ padding: '4px', background: 'none', color: 'var(--danger)' }} onClick={() => handleDelete(l.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{l.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{l.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>₹{Number(l.price).toFixed(0)}</span>
                    <button className="btn btn-secondary btn-sm" onClick={async () => {
                      const res = await api.get(`/marketplace/${l.id}/contact`);
                      toast.success(`Contact: ${res.data.name} — ${res.data.phoneNumber || res.data.email}`);
                    }}>Contact Seller</button>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    By {l.seller?.name || '—'} • {new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">List an Item</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[['Title', 'title', 'text', 'Old DSA textbook...'], ['Price (₹)', 'price', 'number', '150']].map(([label, key, type, placeholder]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input" placeholder={placeholder} required
                    value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Condition, edition, etc..." />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? <span className="spinner" /> : 'List Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
