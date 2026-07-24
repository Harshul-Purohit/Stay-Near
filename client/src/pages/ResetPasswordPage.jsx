import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        showToast('Password reset successfully. You can now login.', 'success');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex justify-center items-center">
      <div className="auth-card card flex flex-col">
        <h2 className="text-center text-headline-md auth-title" style={{ color: 'var(--md-sys-color-primary)' }}>Reset Password</h2>
        <p className="text-center text-body-md auth-subtitle" style={{ color: 'var(--md-sys-color-outline)' }}>Enter your new account password</p>

        {error && <div className="form-error text-center" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md" style={{ marginTop: '15px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-pass">New Password</label>
            <Input
              id="reset-pass"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-conf-pass">Confirm New Password</label>
            <Input
              id="reset-conf-pass"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" className="btn-lg" disabled={loading}>
            {loading ? 'Updating password...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
