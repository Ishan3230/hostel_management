'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { QrCode, RefreshCw } from 'lucide-react';

export default function StudentQR() {
  const [qrData, setQrData] = useState<{ qr: string; studentId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQR = async () => {
    setLoading(true);
    try {
      const res = await api.get('/qr/my-qr');
      setQrData(res.data);
    } catch {
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQR(); }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">My QR Code</span>
          <button className="btn btn-secondary btn-sm" onClick={loadQR}><RefreshCw size={16} /> Refresh</button>
        </div>
        <div className="page-content fade-in">
          <div className="page-header">
            <h1>My Entry QR Code</h1>
            <p>Show this QR to the security guard for hostel entry/exit</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
            <div className="card" style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ marginBottom: 20 }}>
                <QrCode size={48} color="var(--primary-light)" style={{ margin: '0 auto 12px' }} />
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Entry/Exit Pass</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Valid for 24 hours — refreshes each session</p>
              </div>

              {loading ? (
                <div style={{ padding: '60px 0' }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>
              ) : qrData ? (
                <div className="qr-display">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrData.qr} alt="Student QR Code" className="qr-image" width={220} height={220} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Student ID</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all', maxWidth: 260 }}>
                      {qrData.studentId}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--danger)' }}>Failed to load QR code</p>
              )}

              <div className="alert alert-info" style={{ marginTop: 20, textAlign: 'left' }}>
                <div>
                  <strong>📋 Instructions:</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
                    <li>Show this QR to the security guard at the gate</li>
                    <li>Curfew time is 10:00 PM — ensure entry before this</li>
                    <li>Late entries will be flagged and reported to warden</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
