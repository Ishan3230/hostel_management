'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Building2, Users, MessageSquare, AlertTriangle, ClipboardList, ShoppingBag, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, rooms: 0, complaints: 0, alerts: 0, pendingComplaints: 0 });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [students, rooms, complaints, alerts] = await Promise.all([
          api.get('/auth/students'),
          api.get('/rooms'),
          api.get('/complaints'),
          api.get('/emergency/alerts'),
        ]);
        setStats({
          students: students.data.length,
          rooms: rooms.data.length,
          complaints: complaints.data.length,
          alerts: alerts.data.filter((a: any) => a.status === 'ACTIVE').length,
          pendingComplaints: complaints.data.filter((c: any) => c.status === 'PENDING').length,
        });
        setRecentComplaints(complaints.data.slice(0, 5));
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = getSocket();
    socket.on('emergency_alert', (data: any) => {
      toast.error(`🚨 Emergency: ${data.category} alert triggered!`, { duration: 8000 });
      setStats(s => ({ ...s, alerts: s.alerts + 1 }));
    });
    socket.on('new_complaint', () => {
      setStats(s => ({ ...s, complaints: s.complaints + 1, pendingComplaints: s.pendingComplaints + 1 }));
    });
    return () => { socket.off('emergency_alert'); socket.off('new_complaint'); };
  }, []);

  const priorityColor: Record<string, string> = { HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low' };
  const statusColor: Record<string, string> = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-info', RESOLVED: 'badge-resolved' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Admin Dashboard</span>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/admin/emergency'}>
              <Bell size={16} /> Alerts {stats.alerts > 0 && <span className="badge badge-danger" style={{ padding: '1px 6px' }}>{stats.alerts}</span>}
            </button>
          </div>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Welcome, Super Admin 👋</h1>
            <p>Here's what's happening in your hostel today</p>
          </div>

          <div className="stats-grid">
            {[
              { label: 'Total Students', value: stats.students, icon: <Users size={22} />, color: 'blue' },
              { label: 'Total Rooms', value: stats.rooms, icon: <Building2 size={22} />, color: 'cyan' },
              { label: 'Complaints', value: stats.complaints, icon: <MessageSquare size={22} />, color: 'amber' },
              { label: 'Pending Complaints', value: stats.pendingComplaints, icon: <ClipboardList size={22} />, color: 'red' },
              { label: 'Active Alerts', value: stats.alerts, icon: <AlertTriangle size={22} />, color: 'red' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="stat-value">{loading ? '—' : s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Complaints</div>
                <div className="card-subtitle">Last 5 complaints submitted</div>
              </div>
              <a href="/admin/complaints" className="btn btn-secondary btn-sm">View All</a>
            </div>
            {recentComplaints.length === 0 ? (
              <div className="empty-state"><MessageSquare size={40} /><h3>No complaints yet</h3></div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Student</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((c: any) => (
                      <tr key={c.id}>
                        <td style={{ color: 'var(--text-primary)' }}>{c.student?.name || '—'}</td>
                        <td>{c.category}</td>
                        <td><span className={`badge ${priorityColor[c.priority]}`}>{c.priority}</span></td>
                        <td><span className={`badge ${statusColor[c.status]}`}>{c.status}</span></td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
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
