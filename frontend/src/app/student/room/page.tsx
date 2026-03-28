'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Building2, Save, Users, Sparkles, Home } from 'lucide-react';

export default function StudentRoom() {
  const [allocation, setAllocation] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    sleepSchedule: 'EARLY_BIRD',
    cleanliness: 'MODERATE',
    studyHabits: 'QUIET',
    hobbies: '',
  });

  const loadData = async () => {
    try {
      const [allocRes, prefRes] = await Promise.all([
        api.get('/rooms/my-allocation'),
        api.get('/rooms/preferences'),
      ]);
      setAllocation(allocRes.data.allocation);
      setRoommates(allocRes.data.roommates || []);
      if (prefRes.data) {
        setPreferences(prefRes.data);
        setForm({
          sleepSchedule: prefRes.data.sleepSchedule || 'EARLY_BIRD',
          cleanliness: prefRes.data.cleanliness || 'MODERATE',
          studyHabits: prefRes.data.studyHabits || 'QUIET',
          hobbies: prefRes.data.hobbies || '',
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rooms/preferences', form);
      toast.success('Preferences saved! Room compatibility will be calculated.');
      loadData();
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">My Room & Preferences</span>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>My Living Space 🏠</h1>
            <p>Manage your roommate preferences and view room details</p>
          </div>

          <div className="grid-2">
            {/* Preferences Form */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} /> Roommate Preferences</div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                These values are used to calculate compatibility scores for auto-allocation.
              </p>
              <form onSubmit={handleSavePrefs}>
                <div className="form-group">
                  <label className="form-label">Sleep Schedule</label>
                  <select className="form-select" value={form.sleepSchedule} onChange={e => setForm({...form, sleepSchedule: e.target.value})}>
                    <option value="EARLY_BIRD">Early Bird (Wakes up early)</option>
                    <option value="NIGHT_OWL">Night Owl (Stays up late)</option>
                    <option value="FLEXIBLE">Flexible / No preference</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cleanliness</label>
                  <select className="form-select" value={form.cleanliness} onChange={e => setForm({...form, cleanliness: e.target.value})}>
                    <option value="NEAT_FREAK">Neat Freak (Very organized)</option>
                    <option value="MODERATE">Moderate / Normal</option>
                    <option value="MESSY">Messy / Relaxed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Study Habits</label>
                  <select className="form-select" value={form.studyHabits} onChange={e => setForm({...form, studyHabits: e.target.value})}>
                    <option value="QUIET">Quiet (Needs silence)</option>
                    <option value="GROUP">Group (Likes to discuss)</option>
                    <option value="MUSIC">Music (Likes background sound)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hobbies (comma separated)</label>
                  <input type="text" className="form-input" placeholder="Gaming, Reading, Coding..." value={form.hobbies} onChange={e => setForm({...form, hobbies: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                  <Save size={18} /> Save Preferences
                </button>
              </form>
            </div>

            {/* Room Info & Roommates */}
            <div className="flex-col gap-4">
              <div className="card">
                <div className="card-header"><div className="card-title"><Home size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Room Details</div></div>
                {allocation ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600, letterSpacing: '0.05em' }}>ROOM NUMBER</div>
                      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)' }}>{allocation.room?.roomNumber}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Block {allocation.room?.hostelBlock} • Floor {allocation.room?.floor}</div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '20px 0' }}>
                    <Building2 size={32} style={{ marginBottom: 12 }} />
                    <p style={{ fontSize: 13 }}>Room not yet allocated</p>
                  </div>
                )}
              </div>

              {allocation && (
                <div className="card">
                  <div className="card-header"><div className="card-title"><Users size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} /> My Roommates</div></div>
                  {roommates.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No roommates allocated yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {roommates.map((r: any) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-card-hover)', borderRadius: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                            {r.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.department} • Year {r.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
