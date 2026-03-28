'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Flame, Heart, Shield } from 'lucide-react';

const CATEGORIES = [
  { value: 'MEDICAL', label: '🏥 Medical Emergency', icon: <Heart size={32} />, color: '#ef4444' },
  { value: 'FIRE', label: '🔥 Fire Emergency', icon: <Flame size={32} />, color: '#f59e0b' },
  { value: 'SECURITY', label: '🔒 Security Threat', icon: <Shield size={32} />, color: '#6366f1' },
];

export default function EmergencyPage() {
  const [category, setCategory] = useState('MEDICAL');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socket.on('emergency_alert', (d: any) => toast.error(`🚨 ${d.category} Alert received by admin!`));
    return () => { socket.off('emergency_alert'); };
  }, []);

  const handleAlert = async () => {
    setLoading(true);
    try {
      await api.post('/emergency/alert', { category, description, location });
      setSent(true);
      toast.success('Emergency alert sent to admin!', { duration: 5000 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.value === category)!;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar"><span className="topbar-title">Emergency Alert System</span></div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Emergency Alert 🚨</h1>
            <p>Press the button below to send an instant alert to warden and admin</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, maxWidth: 600, margin: '0 auto' }}>
            <div className="card w-full">
              <div className="form-group">
                <label className="form-label">Emergency Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setCategory(c.value)} style={{
                      padding: '16px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: category === c.value ? `${c.color}22` : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${category === c.value ? c.color : 'rgba(255,255,255,0.08)'}`,
                      color: category === c.value ? c.color : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: 12, transition: 'all 0.2s',
                    }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (optional)</label>
                <input type="text" className="form-input" placeholder="Room 204, Block A..." value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-textarea" placeholder="Brief description of emergency..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              {sent ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <CheckCircle size={64} color="var(--success)" />
                  <h2 style={{ color: 'var(--success)' }}>Alert Sent!</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Warden and admin have been notified</p>
                  <button className="btn btn-secondary" onClick={() => setSent(false)}>Send Another Alert</button>
                </div>
              ) : (
                <button
                  className="emergency-btn"
                  onClick={handleAlert}
                  disabled={loading}
                  style={{ background: `linear-gradient(135deg, ${selectedCat.color}, ${selectedCat.color}cc)` }}
                >
                  {loading ? <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} /> : selectedCat.icon}
                  <span style={{ fontSize: 14 }}>{loading ? 'Sending...' : 'SEND ALERT'}</span>
                </button>
              )}
            </div>

            <div className="alert alert-warning w-full">
              <AlertTriangle size={18} />
              <span>Only use this for genuine emergencies. False alarms may result in disciplinary action.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
