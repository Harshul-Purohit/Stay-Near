import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        setResetToken(res.data.resetToken);
        showToast('Password reset link generated.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request reset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex justify-center items-center">
      <div className="auth-card card flex flex-col">
        <h2 className="text-center font-bold text-2xl auth-title">Forgot Password</h2>
        <p className="text-center text-sm text-muted-color auth-subtitle">
          Enter your email to receive a password reset link.
        </p>

        {success ? (
          <div className="flex flex-col gap-md text-center" style={{ marginTop: '15px' }}>
            <div className="badge badge-verified" style={{ padding: '10px', fontSize: '13px' }}>
              ✓ Request Successful
            </div>
            <p className="text-sm">
              We have generated a mock password reset link for your convenience:
            </p>
            <Link 
              to={`/reset-password/${resetToken}`} 
              className="btn btn-primary"
              style={{ textTransform: 'none' }}
            >
              Simulate Password Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-md" style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                className="form-control"
                placeholder="e.g. name@student.university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Generating link...' : 'Generate Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm auth-footer-text" style={{ marginTop: '20px' }}>
          Back to{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--primary-color)' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
