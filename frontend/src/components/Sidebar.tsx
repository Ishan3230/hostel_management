'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home, Building2, QrCode, MessageSquare, Users, UtensilsCrossed,
  BookOpen, AlertTriangle, ShoppingBag, LogOut, Shield, User,
  ClipboardList, BarChart2, Key
} from 'lucide-react';

type UserRole = 'SUPER_ADMIN' | 'WARDEN' | 'STUDENT' | 'SECURITY';

interface NavSection {
  label?: string;
  items: { href: string; label: string; icon: React.ReactNode }[];
}

function getNavSections(role: UserRole): NavSection[] {
  const common = [
    { href: '/', label: 'Dashboard', icon: <Home size={18} /> },
  ];

  if (role === 'SUPER_ADMIN') {
    return [
      { items: common },
      {
        label: 'Management',
        items: [
          { href: '/admin/rooms', label: 'Rooms', icon: <Building2 size={18} /> },
          { href: '/admin/students', label: 'Students', icon: <Users size={18} /> },
          { href: '/admin/complaints', label: 'Complaints', icon: <MessageSquare size={18} /> },
          { href: '/admin/visitors', label: 'Visitors', icon: <Users size={18} /> },
          { href: '/admin/entry-logs', label: 'Entry Logs', icon: <ClipboardList size={18} /> },
          { href: '/admin/mess', label: 'Mess Menu', icon: <UtensilsCrossed size={18} /> },
          { href: '/admin/resources', label: 'Resources', icon: <BookOpen size={18} /> },
          { href: '/admin/emergency', label: 'Alerts', icon: <AlertTriangle size={18} /> },
        ],
      },
      {
        label: 'Analytics',
        items: [
          { href: '/admin/analytics', label: 'Reports', icon: <BarChart2 size={18} /> },
        ],
      },
    ];
  }

  if (role === 'WARDEN') {
    return [
      { items: [{ href: '/warden', label: 'Dashboard', icon: <Home size={18} /> }] },
      {
        label: 'Management',
        items: [
          { href: '/admin/rooms', label: 'Rooms', icon: <Building2 size={18} /> },
          { href: '/admin/complaints', label: 'Complaints', icon: <MessageSquare size={18} /> },
          { href: '/admin/visitors', label: 'Visitors', icon: <Users size={18} /> },
          { href: '/admin/entry-logs', label: 'Entry Logs', icon: <ClipboardList size={18} /> },
          { href: '/admin/mess', label: 'Mess Menu', icon: <UtensilsCrossed size={18} /> },
          { href: '/admin/emergency', label: 'Alerts', icon: <AlertTriangle size={18} /> },
        ],
      },
    ];
  }

  if (role === 'SECURITY') {
    return [
      { items: [{ href: '/security', label: 'Dashboard', icon: <Home size={18} /> }] },
      {
        label: 'Security',
        items: [
          { href: '/security/scan', label: 'QR Scanner', icon: <QrCode size={18} /> },
          { href: '/security/visitors', label: 'Visitors', icon: <Users size={18} /> },
          { href: '/admin/entry-logs', label: 'Entry Logs', icon: <ClipboardList size={18} /> },
        ],
      },
    ];
  }

  // Student
  return [
    { items: [{ href: '/student', label: 'Dashboard', icon: <Home size={18} /> }] },
    {
      label: 'My Hostel',
      items: [
        { href: '/student/room', label: 'My Room', icon: <Building2 size={18} /> },
        { href: '/student/qr', label: 'My QR Code', icon: <QrCode size={18} /> },
        { href: '/student/complaints', label: 'Complaints', icon: <MessageSquare size={18} /> },
        { href: '/student/visitors', label: 'Visitors', icon: <Users size={18} /> },
        { href: '/student/mess', label: 'Mess Menu', icon: <UtensilsCrossed size={18} /> },
        { href: '/student/bookings', label: 'Bookings', icon: <BookOpen size={18} /> },
        { href: '/student/marketplace', label: 'Marketplace', icon: <ShoppingBag size={18} /> },
        { href: '/student/emergency', label: 'Emergency', icon: <AlertTriangle size={18} /> },
      ],
    },
  ];
}

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  WARDEN: 'Warden',
  STUDENT: 'Student',
  SECURITY: 'Security',
};

const roleColors: Record<UserRole, string> = {
  SUPER_ADMIN: '#6366f1',
  WARDEN: '#06b6d4',
  STUDENT: '#10b981',
  SECURITY: '#f59e0b',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  const navSections = getNavSections(user.role);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏠</div>
        <div className="sidebar-logo-text">
          <h2>SmartHostel</h2>
          <p>Management System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="nav-section-label">{section.label}</div>
            )}
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          marginBottom: '12px',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `${roleColors[user.role]}22`,
            border: `2px solid ${roleColors[user.role]}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={16} color={roleColors[user.role]} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '11px', color: roleColors[user.role] }}>{roleLabels[user.role]}</div>
          </div>
        </div>
        <button className="btn btn-secondary w-full" onClick={handleLogout} style={{ justifyContent: 'center' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
