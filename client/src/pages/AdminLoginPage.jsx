import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);
    
    if (result && result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="auth-page flex justify-center items-center" style={{ minHeight: '80vh', backgroundColor: 'var(--surface-color)' }}>
      <div className="auth-card card flex flex-col" style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-container-lowest)' }}>
        <h2 className="text-center text-headline-md auth-title" style={{ color: 'var(--primary-color)' }}>Admin Access</h2>
        <p className="text-center text-body-md auth-subtitle" style={{ color: 'var(--text-secondary)' }}>Log in to the management portal</p>
        
        {error && <div className="form-error text-center" style={{ marginBottom: '15px', color: 'var(--error-color)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md" style={{ marginTop: 'var(--spacing-lg)' }}>
          <div className="form-group">
            <label className="form-label text-label-md" htmlFor="admin-email">Email Address</label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@staynear.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label text-label-md" htmlFor="admin-password">Password</label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="btn-lg" disabled={loading} style={{ marginTop: 'var(--spacing-md)' }}>
            {loading ? 'Authenticating...' : 'Access Portal'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
