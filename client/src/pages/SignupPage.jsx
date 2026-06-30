import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [govtId, setGovtId] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [feeReceipt, setFeeReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all standard fields');
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

    // Role-based documents validation
    if (role === 'owner' && (!govtId || !businessProof)) {
      setError('Hostel owners must upload Government ID & Business Proof');
      return;
    }
    if (role === 'student' && !collegeId) {
      setError('Students must upload their College ID card');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    if (role === 'owner') {
      formData.append('govtId', govtId);
      formData.append('businessProof', businessProof);
    } else {
      formData.append('collegeId', collegeId);
      if (feeReceipt) {
        formData.append('feeReceipt', feeReceipt);
      }
    }

    const result = await signup(formData);
    setLoading(false);

    if (result && result.success) {
      navigate('/');
    } else {
      setError(result?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="auth-page flex justify-center items-center">
      <div className="auth-card card flex flex-col" style={{ maxWidth: '550px' }}>
        <h2 className="text-center font-bold text-2xl auth-title">Create Account</h2>
        <p className="text-center text-sm text-muted-color auth-subtitle">Direct, verified comparison of student housing</p>

        {error && <div className="form-error text-center" style={{ marginBottom: '15px' }}>{error}</div>}

        {/* Role Toggle Selector */}
        <div className="role-selector flex gap-md justify-center" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'} flex-1`}
            onClick={() => { setRole('student'); setError(''); }}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={`btn ${role === 'owner' ? 'btn-primary' : 'btn-secondary'} flex-1`}
            onClick={() => { setRole('owner'); setError(''); }}
          >
            🏢 Hostel Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md" encType="multipart/form-data">
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className="form-control"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className="form-control"
              placeholder="e.g. rahul.sharma@jecrc.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                className="form-control"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label" htmlFor="signup-conf-password">Confirm Password</label>
              <input
                id="signup-conf-password"
                type="password"
                className="form-control"
                placeholder="Match password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Document Upload Group */}
          <div className="document-upload-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <h4 className="font-semibold text-sm" style={{ marginBottom: '10px' }}>
              Verification Documents Required (Admin Approved)
            </h4>

            {role === 'student' ? (
              <div className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-collegeId">College Student ID Card (Required)</label>
                  <input
                    id="doc-collegeId"
                    type="file"
                    accept="image/*,.pdf"
                    className="form-control"
                    onChange={(e) => setCollegeId(e.target.files[0])}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-feeReceipt">College Fee Receipt (Optional)</label>
                  <input
                    id="doc-feeReceipt"
                    type="file"
                    accept="image/*,.pdf"
                    className="form-control"
                    onChange={(e) => setFeeReceipt(e.target.files[0])}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-govtId">Government ID Card (Aadhaar / PAN) (Required)</label>
                  <input
                    id="doc-govtId"
                    type="file"
                    accept="image/*,.pdf"
                    className="form-control"
                    onChange={(e) => setGovtId(e.target.files[0])}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-businessProof">Hostel Ownership / Business License (Required)</label>
                  <input
                    id="doc-businessProof"
                    type="file"
                    accept="image/*,.pdf"
                    className="form-control"
                    onChange={(e) => setBusinessProof(e.target.files[0])}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Registering Account...' : 'Complete Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm auth-footer-text" style={{ marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--primary-color)' }}>
            Log In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
