'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Search, Clock, Calendar, CheckCircle } from 'lucide-react';

export default function SecurityVisitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisitors = async () => {
    try {
      const res = await api.get('/visitors/approved');
      setVisitors(res.data);
    } catch {
      toast.error('Failed to load approved visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVisitors(); }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Approved Visitors List</span>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Visitor Access 👮</h1>
            <p>View visitors approved by warden for today's entry</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Approved for Today</div>
            </div>
            {visitors.length === 0 ? (
              <div className="empty-state">
                <Users size={40} />
                <h3>No approved visitors for today</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Visitor</th><th>Resident Student</th><th>Purpose</th><th>Expected Time</th><th>QR Token</th></tr>
                  </thead>
                  <tbody>
                    {visitors.map((v: any) => (
                      <tr key={v.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.visitorName}</div>
                          <div style={{ fontSize: 11 }}>{v.visitorPhone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{v.student?.name}</div>
                          <div style={{ fontSize: 11 }}>{v.student?.studentId}</div>
                        </td>
                        <td>{v.purpose}</td>
                        <td style={{ fontSize: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {v.expectedEntryTime.split('T')[1]?.substring(0, 5)}</div>
                        </td>
                        <td>
                          <code style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>{v.qrToken}</code>
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
