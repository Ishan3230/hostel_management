'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) {
      router.replace('/login');
      return;
    }
    const parsed = JSON.parse(user);
    const role = parsed?.role;
    if (role === 'SUPER_ADMIN') router.replace('/admin');
    else if (role === 'WARDEN') router.replace('/warden');
    else if (role === 'SECURITY') router.replace('/security');
    else router.replace('/student');
  }, [router]);

  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  );
}
