'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Building2, Plus, UserPlus, Trash2, Filter } from 'lucide-react';

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [roomForm, setRoomForm] = useState({ roomNumber: '', floor: '', capacity: '2', type: 'STUDENT', hostelBlock: 'A' });
  const [allocForm, setAllocForm] = useState({ studentId: '', roomNumber: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes, allocsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/auth/students'),
        api.get('/rooms/allocations'),
      ]);
      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
      setAllocations(allocsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rooms', { ...roomForm, floor: Number(roomForm.floor), capacity: Number(roomForm.capacity) });
      toast.success('Room created successfully');
      setShowRoomModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleManualAlloc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rooms/allocate/manual', allocForm);
      toast.success('Allocation successful');
      setShowAllocModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    }
  };

  const handleAutoAllocate = async () => {
    if (!confirm('This will auto-assign rooms based on compatibility scores. Proceed?')) return;
    try {
      const res = await api.post('/rooms/allocate/auto');
      toast.success(`Allocated ${res.data.allocatedCount} students!`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Auto-allocation failed');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">Room Management</span>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleAutoAllocate}>
              <Filter size={16} /> Auto-Allocate
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowRoomModal(true)}>
              <Plus size={16} /> Add Room
            </button>
          </div>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Hostel Rooms & Allocation</h1>
            <p>Manage room capacity, blocks, and student assignments</p>
          </div>

          <div className="grid-2">
            {/* Rooms List */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">All Rooms ({rooms.length})</div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Room</th><th>Block</th><th>Floor</th><th>Type</th><th>Occupancy</th></tr>
                  </thead>
                  <tbody>
                    {rooms.map((r: any) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.roomNumber}</td>
                        <td>{r.hostelBlock}</td>
                        <td>{r.floor}</td>
                        <td><span className="badge badge-info">{r.type}</span></td>
                        <td>{r.currentOccupancy} / {r.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Current Allocations */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Allocations</div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAllocModal(true)}>
                  <UserPlus size={14} /> Manual Alloc
                </button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Student</th><th>Room</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {allocations.slice(0, 10).map((a: any) => (
                      <tr key={a.id}>
                        <td style={{ color: 'var(--text-primary)' }}>{a.student?.name}</td>
                        <td>{a.room?.roomNumber}</td>
                        <td>{new Date(a.allottedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Room Modal */}
      {showRoomModal && (
        <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Room</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRoomModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateRoom}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input type="text" className="form-input" required placeholder="101" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hostel Block</label>
                  <input type="text" className="form-input" required placeholder="A" value={roomForm.hostelBlock} onChange={e => setRoomForm({...roomForm, hostelBlock: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Floor</label>
                  <input type="number" className="form-input" required value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-input" required value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select className="form-select" value={roomForm.type} onChange={e => setRoomForm({...roomForm, type: e.target.value})}>
                  <option value="STUDENT">Student Room</option>
                  <option value="GUEST">Guest Room</option>
                  <option value="WARDEN">Warden Room</option>
                </select>
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Allocation Modal */}
      {showAllocModal && (
        <div className="modal-overlay" onClick={() => setShowAllocModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Manual Room Allocation</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAllocModal(false)}>✕</button>
            </div>
            <form onSubmit={handleManualAlloc}>
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select className="form-select" required value={allocForm.studentId} onChange={e => setAllocForm({...allocForm, studentId: e.target.value})}>
                  <option value="">Choose a student...</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Select Room</label>
                <select className="form-select" required value={allocForm.roomNumber} onChange={e => setAllocForm({...allocForm, roomNumber: e.target.value})}>
                  <option value="">Choose a room...</option>
                  {rooms.filter(r => r.currentOccupancy < r.capacity).map((r: any) => (
                    <option key={r.id} value={r.roomNumber}>{r.roomNumber} (Space: {r.capacity - r.currentOccupancy})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
