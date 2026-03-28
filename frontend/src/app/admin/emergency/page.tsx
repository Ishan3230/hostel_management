'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Clock, MapPin, User, MessageCircle } from 'lucide-react';
import { getSocket } from '@/lib/socket';

export default function AdminEmergency() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const res = await api.get('/emergency/alerts');
      setAlerts(res.data);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const socket = getSocket();
    socket.on('emergency_alert', () => {
      loadAlerts();
    });
    return () => { socket.off('emergency_alert'); };
  }, []);

  const resolveAlert = async (id: string) => {
    const resolutionNotes = prompt('Enter resolution notes:');
    if (resolutionNotes === null) return;
    try {
      await api.patch(`/emergency/alert/${id}/resolve`, { resolutionNotes });
      toast.success('Alert resolved');
      loadAlerts();
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const statusClass: Record<string, string> = { ACTIVE: 'badge-high', RESOLVED: 'badge-resolved' };
  const catColors: Record<string, string> = { MEDICAL: '#ef4444', FIRE: '#f59e0b', SECURITY: '#6366f1' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Emergency History</span>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Emergency Management 🚨</h1>
            <p>Monitor active emergencies and review past incident resolutions</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">All Emergency Alerts</div>
            </div>
            {alerts.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={40} color="var(--success)" />
                <h3>No active emergencies</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Type</th><th>Student</th><th>Location</th><th>Message</th><th>Status</th><th>Time</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {alerts.map((a: any) => (
                      <tr key={a.id}>
                        <td><span className="badge" style={{ backgroundColor: `${catColors[a.category]}22`, color: catColors[a.category], border: `1px solid ${catColors[a.category]}44` }}>{a.category}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.student?.name}</div>
                          <div style={{ fontSize: 11 }}>{a.student?.studentId}</div>
                        </td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {a.location || 'Unknown'}</div></td>
                        <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.description || '—'}</td>
                        <td><span className={`badge ${statusClass[a.status]}`}>{a.status}</span></td>
                        <td>{new Date(a.createdAt).toLocaleString()}</td>
                        <td>
                          {a.status === 'ACTIVE' ? (
                            <button className="btn btn-success btn-sm" onClick={() => resolveAlert(a.id)}>Resolve</button>
                          ) : (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resolved</div>
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
