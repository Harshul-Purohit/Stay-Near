import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
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
      // Decode user role redirect
      // Quick fetch of role from context will happen inside login
      navigate('/');
    } else {
      setError(result?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="auth-page flex justify-center items-center">
      <div className="auth-card card flex flex-col">
        <h2 className="text-center font-bold text-2xl auth-title">Welcome Back</h2>
        <p className="text-center text-sm text-muted-color auth-subtitle">Log in to find verified student hostels near university</p>
        
        {error && <div className="form-error text-center" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="e.g. name@student.university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center" style={{ width: '100%' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="text-sm nav-link font-medium" style={{ color: 'var(--primary-color)' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm auth-footer-text" style={{ marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold" style={{ color: 'var(--primary-color)' }}>
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
