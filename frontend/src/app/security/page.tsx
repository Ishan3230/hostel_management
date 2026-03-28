'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { QrCode, ClipboardList, Users } from 'lucide-react';

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalToday: 0, lateToday: 0 });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/qr/logs?date=${today}`).then(r => {
      setLogs(r.data.slice(0, 10));
      setStats({ totalToday: r.data.length, lateToday: r.data.filter((l: any) => l.isLate).length });
    }).catch(() => toast.error('Failed to load logs'));
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Security Dashboard</span>
          <a href="/security/scan" className="btn btn-primary btn-sm"><QrCode size={16} /> Scan QR</a>
        </div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Security Guard 👮</h1>
            <p>Today's entry/exit monitoring</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon blue"><ClipboardList size={22} /></div>
              <div><div className="stat-value">{stats.totalToday}</div><div className="stat-label">Today's Total Entries</div></div>
            </div>
            <div className="stat-card"><div className="stat-icon red"><ClipboardList size={22} /></div>
              <div><div className="stat-value">{stats.lateToday}</div><div className="stat-label">Late Entries Today</div></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Today's Entry/Exit Log</div>
              <a href="/admin/entry-logs" className="btn btn-secondary btn-sm">Full Log</a>
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Student</th><th>Type</th><th>Time</th><th>Late?</th></tr></thead>
                <tbody>
                  {logs.map((l: any) => (
                    <tr key={l.id}>
                      <td style={{ color: 'var(--text-primary)' }}>{l.student?.name || '—'}</td>
                      <td><span className={`badge ${l.type === 'ENTRY' ? 'badge-active' : 'badge-info'}`}>{l.type}</span></td>
                      <td>{new Date(l.timestamp).toLocaleTimeString()}</td>
                      <td>{l.isLate ? <span className="badge badge-danger">LATE</span> : <span className="badge badge-active">OK</span>}</td>
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
