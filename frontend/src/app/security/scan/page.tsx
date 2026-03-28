'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { QrCode, Shield, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SecurityScan() {
  const [token, setToken] = useState('');
  const [target, setTarget] = useState('STUDENT');
  const [type, setType] = useState('ENTRY');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setScanResult(null);
    try {
      const endpoint = target === 'STUDENT' ? '/qr/scan' : '/visitors/scan';
      const res = await api.post(endpoint, { qrToken: token, type });
      const log = res.data.log || res.data.pass;
      setScanResult(log);
      
      0
      
      if (log.isLate) {
        toast.error('Curfew Violation Detected!', { icon: '🚨', duration: 5000 });
      }
      setToken('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">QR Scanner</span>
        </div>

        <div className="page-content fade-in">
          <div className="page-header">
            <h1>Hostel Entry/Exit Scanner</h1>
            <p>Scan student QR codes or enter token manually for verification</p>
          </div>

          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary-light)'
                }}>
                  <QrCode size={40} />
                </div>
                <h2>Ready to Scan</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enter the student's unique QR session token</p>
              </div>

              <form onSubmit={handleScan}>
                <div className="form-group">
                  <label className="form-label">Who is scanning?</label>
                  <div className="grid-2">
                    <button
                      type="button"
                      className={`btn ${target === 'STUDENT' ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{ 
                        background: target === 'STUDENT' ? 'var(--primary)' : 'var(--bg-card)',
                        borderColor: target === 'STUDENT' ? 'var(--primary)' : 'var(--border)'
                      }}
                      onClick={() => setTarget('STUDENT')}
                    >
                      Resident Student
                    </button>
                    <button
                      type="button"
                      className={`btn ${target === 'VISITOR' ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{ 
                        background: target === 'VISITOR' ? 'var(--primary)' : 'var(--bg-card)',
                        borderColor: target === 'VISITOR' ? 'var(--primary)' : 'var(--border)'
                      }}
                      onClick={() => setTarget('VISITOR')}
                    >
                      External Visitor
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scan Type</label>
                  <div className="grid-2">
                    <button
                      type="button"
                      className={`btn ${type === 'ENTRY' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setType('ENTRY')}
                      style={{ justifyContent: 'center' }}
                    >
                      ENTRY
                    </button>
                    <button
                      type="button"
                      className={`btn ${type === 'EXIT' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setType('EXIT')}
                      style={{ justifyContent: 'center' }}
                    >
                      EXIT
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">QR Token / Student ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter token..."
                    required
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    style={{ fontSize: 16, textAlign: 'center', letterSpacing: 2 }}
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '14px' }} disabled={loading}>
                  {loading ? <span className="spinner" /> : <Shield size={18} />}
                  {loading ? 'Verifying...' : `Confirm ${type}`}
                </button>
              </form>
            </div>

            {scanResult && (
              <div className={`card fade-in ${scanResult.isLate ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: 24, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {scanResult.isLate ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                      {scanResult.isLate ? 'LATE ENTRY DETECTED' : `${type} GRANTED`}
                    </h3>
                    <p style={{ fontSize: 14 }}>
                      {target === 'STUDENT' ? (
                        <>Student: <strong>{scanResult.student?.name}</strong> ({scanResult.student?.studentId})</>
                      ) : (
                        <>Visitor: <strong>{scanResult.visitorName}</strong> (Purpose: {scanResult.purpose})</>
                      )}
                    </p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>
                      Timestamp: {new Date(scanResult.timestamp || scanResult.actualEntryTime || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
