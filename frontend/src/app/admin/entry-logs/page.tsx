'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ClipboardList, Filter, Download, AlertCircle } from 'lucide-react';

export default function AdminEntryLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/qr/logs?date=${date}`);
      setLogs(res.data);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, [date]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Entry/Exit Logs</span>
          <div className="topbar-actions">
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <button className="btn btn-secondary btn-sm" onClick={() => toast('Export to CSV coming soon')}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Hostel Access Logs</h1>
            <p>Monitoring student movements and curfew compliance</p>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Logs for {new Date(date).toLocaleDateString()}</div>
            </div>

            {loading ? (
              <div className="empty-state"><span className="spinner" /></div>
            ) : logs.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={40} />
                <h3>No logs found for this date</h3>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l: any) => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{new Date(l.timestamp).toLocaleTimeString()}</td>
                        <td style={{ color: 'var(--text-primary)' }}>{l.student?.name}</td>
                        <td style={{ fontSize: 13 }}>{l.student?.studentId}</td>
                        <td>
                          <span className={`badge ${l.type === 'ENTRY' ? 'badge-active' : 'badge-info'}`}>
                            {l.type}
                          </span>
                        </td>
                        <td>
                          {l.isLate ? (
                            <span className="badge badge-high" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                              <AlertCircle size={10} /> LATE
                            </span>
                          ) : (
                            <span className="badge badge-active">ON TIME</span>
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
