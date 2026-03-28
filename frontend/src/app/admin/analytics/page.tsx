'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BarChart, Users, Building, MessageSquare, AlertTriangle, TrendingUp, PieChart } from 'lucide-react';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [compAnalytics, setCompAnalytics] = useState<any>(null);
  const [messAnalytics, setMessAnalytics] = useState<any>(null);

  const loadData = async () => {
    try {
      const [studentsRes, roomsRes, compRes, messRes] = await Promise.all([
        api.get('/auth/students'),
        api.get('/rooms'),
        api.get('/complaints/analytics'),
        api.get('/mess/analytics'),
      ]);
      setStats({
        students: studentsRes.data.length,
        rooms: roomsRes.data.length,
        occupancy: roomsRes.data.reduce((acc: number, r: any) => acc + r.currentOccupancy, 0),
        capacity: roomsRes.data.reduce((acc: number, r: any) => acc + r.capacity, 0),
      });
      setCompAnalytics(compRes.data);
      setMessAnalytics(messRes.data);
    } catch {
      toast.error('Failed to load analytics data');
    }
  };

  useEffect(() => { loadData(); }, []);

  const occupancyRate = stats ? (stats.occupancy / stats.capacity) * 100 : 0;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar"><span className="topbar-title">Analytics & Reports</span></div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Hostel Analytics Dashboard 📊</h1>
            <p>Data-driven insights into hostel operations and student metrics</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><Users size={22} /></div>
              <div><div className="stat-value">{stats?.students || 0}</div><div className="stat-label">Total Residents</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><TrendingUp size={22} /></div>
              <div><div className="stat-value">{occupancyRate.toFixed(1)}%</div><div className="stat-label">Occupancy Rate</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><MessageSquare size={22} /></div>
              <div><div className="stat-value">{compAnalytics?.totalComplaints || 0}</div><div className="stat-label">Total Complaints</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><AlertTriangle size={22} /></div>
              <div><div className="stat-value">{compAnalytics?.byPriority?.find((p: any) => p.priority === 'HIGH')?.count || 0}</div><div className="stat-label">High Priority Issues</div></div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title">Complaints by Category</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(compAnalytics?.byCategory || []).map((c: any) => (
                  <div key={c.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span>{c.category}</span>
                      <span style={{ fontWeight: 600 }}>{c.count}</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4, background: 'var(--primary)',
                        width: `${(c.count / compAnalytics.totalComplaints) * 100}%`
                      }}></div>
                    </div>
                  </div>
                ))}
                {(!compAnalytics?.byCategory || compAnalytics.byCategory.length === 0) && <div className="empty-state">No data available</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Mess Feedback Summary</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(messAnalytics?.averageRatings || []).map((m: any) => (
                  <div key={m.mealType}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span>{m.mealType}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {Number(m.averageRating).toFixed(1)}</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4, background: '#f59e0b',
                        width: `${(m.averageRating / 5) * 100}%`
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
