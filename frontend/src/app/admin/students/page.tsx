'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Search, Mail, Phone, MapPin, Hash } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      const res = await api.get('/auth/students');
      setStudents(res.data);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Student Directory</span>
          <div className="topbar-actions" style={{ width: 300 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search students..."
                style={{ paddingLeft: 36 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Students List ({filtered.length})</h1>
            <p>View and manage all registered hostel residents</p>
          </div>

          <div className="grid-auto">
            {filtered.map((s: any) => (
              <div className="card" key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)',
                    fontSize: 20, fontWeight: 700
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.department || 'N/A'} • Year {s.year || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Hash size={14} /> <span>{s.studentId || 'No ID'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Mail size={14} /> <span>{s.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Phone size={14} /> <span>{s.phoneNumber || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.address || 'N/A'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="badge badge-info">{s.role}</span>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={() => toast('Profile editing coming soon')}>
                    Edit Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="empty-state">
              <Users size={40} />
              <h3>No students found</h3>
              <p>Try searching with a different name or ID</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
