'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Building2, QrCode, MessageSquare, CalendarCheck, AlertTriangle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [allocation, setAllocation] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const fetchData = async () => {
      try {
        const [allocRes, compRes, bookRes] = await Promise.all([
          api.get('/rooms/my-allocation'),
          api.get('/complaints/my'),
          api.get('/resources/bookings/my'),
        ]);
        setAllocation(allocRes.data.allocation);
        setComplaints(compRes.data);
        setBookings(bookRes.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = getSocket();
    socket.on('emergency_alert', (data: any) => {
      toast.error(`🚨 ${data.category} Alert: ${data.description || 'Emergency in hostel!'}`, { duration: 10000 });
    });
    socket.on('complaint_update', (data: any) => {
      toast.success(`Complaint status updated: ${data.status}`);
    });
    return () => { socket.off('emergency_alert'); socket.off('complaint_update'); };
  }, []);

  const pendingComplaints = complaints.filter(c => c.status === 'PENDING').length;
  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Student Dashboard</span>
          <div className="topbar-actions">
            <a href="/student/emergency" className="btn btn-danger btn-sm">
              <AlertTriangle size={16} /> Emergency
            </a>
          </div>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Welcome, {user?.name || 'Student'} 👋</h1>
            <p>{user?.department && `${user.department} • `}Year {user?.year || '—'} • ID: {user?.studentId || '—'}</p>
          </div>

          <div className="stats-grid">
            {[
              { label: 'My Room', value: allocation ? allocation.room?.roomNumber : 'Not Allocated', icon: <Building2 size={22} />, color: 'blue', href: '/student/room' },
              { label: 'My QR Code', value: 'View QR', icon: <QrCode size={22} />, color: 'cyan', href: '/student/qr' },
              { label: 'Pending Complaints', value: pendingComplaints, icon: <MessageSquare size={22} />, color: 'amber', href: '/student/complaints' },
              { label: 'Active Bookings', value: upcomingBookings, icon: <CalendarCheck size={22} />, color: 'green', href: '/student/bookings' },
            ].map(s => (
              <a href={s.href} key={s.label} className="stat-card" style={{ textDecoration: 'none' }}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="stat-value" style={{ fontSize: typeof s.value === 'string' && s.value.length > 8 ? '18px' : '28px' }}>
                    {loading ? '—' : s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">My Complaints</div>
                <a href="/student/complaints" className="btn btn-secondary btn-sm">View All</a>
              </div>
              {complaints.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <MessageSquare size={32} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>No complaints yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {complaints.slice(0, 3).map((c: any) => (
                    <div key={c.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13 }}>{c.category}</span>
                      <span className={`badge ${c.status === 'RESOLVED' ? 'badge-resolved' : c.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-pending'}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Room Info</div>
              </div>
              {allocation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Room Number', value: allocation.room?.roomNumber },
                    { label: 'Block', value: allocation.room?.hostelBlock || '—' },
                    { label: 'Floor', value: allocation.room?.floor },
                    { label: 'Room Type', value: allocation.room?.type },
                    { label: 'Allocated On', value: new Date(allocation.allottedAt).toLocaleDateString() },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <Building2 size={32} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13 }}>No room allocated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
