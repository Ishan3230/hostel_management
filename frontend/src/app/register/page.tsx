'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phoneNumber: '',
    address: '', dateOfBirth: '', department: '', year: '', studentId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, year: form.year ? Number(form.year) : null, role: 'STUDENT' });
      toast.success('Registered successfully! Please login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (key: string) => ({
    value: (form as any)[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 580 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <h1>Student Registration</h1>
          <p>Create your hostel account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" placeholder="Ravi Kumar" required {...f('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="ravi@college.edu" required {...f('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" placeholder="Min 6 characters" required {...f('password')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" placeholder="9876543210" {...f('phoneNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input type="text" className="form-input" placeholder="STU2024001" {...f('studentId')} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" {...f('dateOfBirth')} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" className="form-input" placeholder="MCA / BTech" {...f('department')} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="number" className="form-input" placeholder="1" min="1" max="5" {...f('year')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" className="form-input" placeholder="Home address" {...f('address')} />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : <UserPlus size={18} />}
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Sign in here</a>
        </p>
      </div>
    </div>
  );
}
