'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { Building2, Users, MessageSquare, AlertTriangle, ClipboardList } from 'lucide-react';

export default function WardenDashboard() {
  const [stats, setStats] = useState({ students: 0, rooms: 0, complaints: 0, lateEntries: 0, alerts: 0 });
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [students, rooms, complaints, lateEntries, alerts] = await Promise.all([
          api.get('/auth/students'),
          api.get('/rooms'),
          api.get('/complaints'),
          api.get('/qr/logs/late'),
          api.get('/emergency/alerts'),
        ]);
        setStats({
          students: students.data.length,
          rooms: rooms.data.length,
          complaints: complaints.data.length,
          lateEntries: lateEntries.data.length,
          alerts: alerts.data.filter((a: any) => a.status === 'ACTIVE').length,
        });
        setRecentComplaints(complaints.data.slice(0, 5));
      } catch {
        toast.error('Failed to load data');
      }
    };
    fetchData();
    const socket = getSocket();
    socket.on('emergency_alert', (d: any) => toast.error(`🚨 ${d.category} Alert!`, { duration: 8000 }));
    return () => { socket.off('emergency_alert'); };
  }, []);

  const statusColor: Record<string, string> = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-info', RESOLVED: 'badge-resolved' };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar"><span className="topbar-title">Warden Dashboard</span></div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Warden Dashboard 🛡️</h1>
            <p>Hostel overview and management</p>
          </div>
          <div className="stats-grid">
            {[
              { label: 'Total Students', value: stats.students, icon: <Users size={22} />, color: 'blue' },
              { label: 'Total Rooms', value: stats.rooms, icon: <Building2 size={22} />, color: 'cyan' },
              { label: 'Total Complaints', value: stats.complaints, icon: <MessageSquare size={22} />, color: 'amber' },
              { label: 'Late Entries', value: stats.lateEntries, icon: <ClipboardList size={22} />, color: 'red' },
              { label: 'Active Alerts', value: stats.alerts, icon: <AlertTriangle size={22} />, color: 'red' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Complaints</div>
              <a href="/admin/complaints" className="btn btn-secondary btn-sm">Manage</a>
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Student</th><th>Category</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {recentComplaints.map((c: any) => (
                    <tr key={c.id}>
                      <td>{c.student?.name || '—'}</td>
                      <td>{c.category}</td>
                      <td><span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                      <td><span className={`badge ${statusColor[c.status]}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
