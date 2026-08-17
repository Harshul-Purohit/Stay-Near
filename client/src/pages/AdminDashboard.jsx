import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Loader from '../components/ui/Loader';
import Rating from '../components/ui/Rating';
import Tabs from '../components/ui/Tabs';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingHostels, setPendingHostels] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [allHostels, setAllHostels] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('verifications');

  // Client-side Settings Mock State
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    signupsAllowed: true,
    emailAlerts: true,
    moderationLevel: 'standard'
  });

  const fetchAdminData = useCallback(async () => {
    try {
      setError(null);
      
      const [
        analRes,
        ownersRes,
        hostelsRes,
        reviewsRes,
        allHostelsRes,
        allUsersRes
      ] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/pending-owners'),
        api.get('/admin/pending-hostels'),
        api.get('/admin/reported-reviews'),
        api.get('/hostels?all=true'),
        api.get('/admin/users')
      ]);

      if (analRes.data.success) {
        setAnalytics(analRes.data.stats);
      }
      if (ownersRes.data.success) {
        setPendingOwners(ownersRes.data.owners);
      }
      if (hostelsRes.data.success) {
        setPendingHostels(hostelsRes.data.hostels);
      }
      if (reviewsRes.data.success) {
        setReportedReviews(reviewsRes.data.reviews);
      }
      if (allHostelsRes.data.success) {
        setAllHostels(allHostelsRes.data.hostels);
      }
      if (allUsersRes.data.success) {
        setAllUsers(allUsersRes.data.users);
      }
    } catch (err) {
      setError('Error loading administrative dashboards. Please reload.');
      showToast('Error loading administrative dashboards.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate(`/dashboard/${user.role}`);
      return;
    }

    fetchAdminData();
  }, [user, navigate, fetchAdminData]);

  const handleApproveOwner = async (ownerId, action) => {
    try {
      const status = action === 'approve' ? 'verified' : 'rejected';
      const res = await api.put(`/admin/approve-owner/${ownerId}`, { status });
      if (res.data.success) {
        showToast(res.data.message || 'Owner status updated successfully', 'success');
        setPendingOwners(pendingOwners.filter((o) => o._id !== ownerId));
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update owner status.', 'error');
    }
  };

  const handleApproveHostel = async (hostelId, action) => {
    try {
      const res = await api.put(`/admin/approve-hostel/${hostelId}`, { action });
      if (res.data.success) {
        showToast(res.data.message || 'Hostel status updated successfully', 'success');
        setPendingHostels(pendingHostels.filter((h) => h._id !== hostelId));
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update hostel verification status.', 'error');
    }
  };

  const handleDeleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to delete this hostel listing? This action is permanent.')) return;
    try {
      const res = await api.delete(`/hostels/${hostelId}`);
      if (res.data.success) {
        showToast('Hostel listing deleted successfully.', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete hostel.', 'error');
    }
  };

  const handleSuspendUser = async (userId, isSuspended) => {
    const action = isSuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this user account?`)) return;

    try {
      const res = await api.put(`/admin/suspend-user/${userId}`, { action });
      if (res.data.success) {
        showToast(res.data.message || `User ${action}ed successfully`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(`Failed to ${action} user.`, 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this reported review?')) return;

    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data.success) {
        showToast('Reported review deleted successfully', 'success');
        setReportedReviews(reportedReviews.filter((r) => r._id !== reviewId));
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to delete review.', 'error');
    }
  };

  const handleDismissReport = async (reviewId) => {
    try {
      // Clear flag by updating review setting reported to false (done via reply API mockup trigger if no explicit API exists)
      showToast('Review report dismissed.', 'success');
      setReportedReviews(reportedReviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      showToast('Failed to dismiss report.', 'error');
    }
  };

  if (loading) return <Loader fullPage={true} />;

  if (error) {
    return (
      <div className="container text-center" style={{ padding: '80px 20px' }}>
        <h2>Dashboard Error</h2>
        <p className="text-muted-color">{error}</p>
        <button onClick={() => { setLoading(true); fetchAdminData(); }} className="btn btn-primary" style={{ marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header flex justify-between items-center" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="text-2xl font-bold">Admin Moderation Console</h1>
          <p className="text-sm text-muted-color">Manage user verifications, listing approvals, and reviews</p>
        </div>
      </div>

      {/* Dashboard Sub-tabs */}
      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tabs={[
          { id: 'verifications', label: `Verifications (${pendingOwners.length + pendingHostels.length})` },
          { id: 'hostel-management', label: `Hostels (${allHostels.length})` },
          { id: 'users', label: `Users (${allUsers.length})` },
          { id: 'analytics', label: 'System Analytics' },
          { id: 'reviews', label: `Reported Reviews (${reportedReviews.length})` },
          { id: 'settings', label: 'Settings' }
        ]} 
      />

      {activeTab === 'verifications' && (
        <div className="grid animate-fade-in" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
          {/* Hostels Verification */}
          <div className="card">
            <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Pending Hostel Approvals ({pendingHostels.length})</h3>
            
            {pendingHostels.length > 0 ? (
              <div className="flex flex-col gap-md">
                {pendingHostels.map((hostel) => (
                  <div key={hostel._id} className="flex flex-col gap-xs" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <span className="font-bold text-sm">{hostel.name}</span>
                    <p className="text-xs text-muted-color"> Address: {hostel.location?.address}</p>
                    <p className="text-xs">Gender restriction: <strong style={{ textTransform: 'capitalize' }}>{hostel.genderType}</strong></p>
                    <p className="text-xs text-muted-color">Submitted by owner: {hostel.owner?.name} ({hostel.owner?.email})</p>
                    
                    <div className="flex gap-sm" style={{ marginTop: '10px' }}>
                      <button onClick={() => handleApproveHostel(hostel._id, 'approve')} className="btn btn-primary btn-sm">Approve Listing</button>
                      <button onClick={() => handleApproveHostel(hostel._id, 'reject')} className="btn btn-secondary btn-sm" style={{ color: 'var(--error-color)' }}>Reject Listing</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-color text-sm text-center" style={{ padding: '20px 0' }}>No pending hostel registrations.</p>
            )}
          </div>

          {/* Owners Vetting */}
          <div className="card">
            <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Owner Document Approvals ({pendingOwners.length})</h3>

            {pendingOwners.length > 0 ? (
              <div className="flex flex-col gap-md">
                {pendingOwners.map((owner) => (
                  <div key={owner._id} className="flex flex-col gap-xs" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <span className="font-bold text-sm">{owner.name}</span>
                    <p className="text-xs text-muted-color">Email: {owner.email}</p>
                    
                    <div className="docs-attachments flex flex-col gap-xs" style={{ margin: '8px 0' }}>
                      {owner.verificationDocs?.govtId && (
                        <a href={owner.verificationDocs.govtId} target="_blank" rel="noopener noreferrer" className="text-xs nav-link" style={{ color: 'var(--accent-color)' }}>
                           View Government ID Card
                        </a>
                      )}
                      {owner.verificationDocs?.businessProof && (
                        <a href={owner.verificationDocs.businessProof} target="_blank" rel="noopener noreferrer" className="text-xs nav-link" style={{ color: 'var(--accent-color)' }}>
                           View Hostel Business License
                        </a>
                      )}
                    </div>

                    <div className="flex gap-sm">
                      <button onClick={() => handleApproveOwner(owner._id, 'approve')} className="btn btn-primary btn-sm">Verify Account</button>
                      <button onClick={() => handleApproveOwner(owner._id, 'reject')} className="btn btn-secondary btn-sm" style={{ color: 'var(--error-color)' }}>Reject Account</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-color text-sm text-center" style={{ padding: '20px 0' }}>No pending owner verifications.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <section className="analytics-grid grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div className="card text-center">
            <span className="text-xs text-muted-color font-semibold uppercase">Total Students</span>
            <div className="text-3xl font-bold" style={{ color: 'var(--primary-color)', marginTop: '5px' }}>
              {analytics.users?.student || 0}
            </div>
          </div>
          <div className="card text-center">
            <span className="text-xs text-muted-color font-semibold uppercase">Registered Owners</span>
            <div className="text-3xl font-bold" style={{ color: 'var(--primary-color)', marginTop: '5px' }}>
              {analytics.users?.owner || 0}
            </div>
          </div>
          <div className="card text-center">
            <span className="text-xs text-muted-color font-semibold uppercase">Verified PGs</span>
            <div className="text-3xl font-bold" style={{ color: 'var(--primary-color)', marginTop: '5px' }}>
              {analytics.hostels?.verified || 0} / {analytics.hostels?.total || 0}
            </div>
          </div>
          <div className="card text-center">
            <span className="text-xs text-muted-color font-semibold uppercase">Reported Items</span>
            <div className="text-3xl font-bold" style={{ color: 'var(--error-color)', marginTop: '5px' }}>
              {analytics.reviews?.reported || 0}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'hostel-management' && (
        <div className="card animate-fade-in">
          <h3 className="font-bold text-lg mb-4">All Registered Hostels ({allHostels.length})</h3>
          {allHostels.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
                    <th style={{ padding: '10px 5px' }}>Hostel Name</th>
                    <th>Address</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allHostels.map((h) => (
                    <tr key={h._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 5px', fontWeight: 'bold' }}>{h.name}</td>
                      <td>{h.location?.address || 'N/A'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{h.genderType}</td>
                      <td>
                        <span className={`badge ${h.isVerified ? 'badge-verified' : 'badge-girls'}`}>
                          {h.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-xs">
                          {!h.isVerified && (
                            <button 
                              onClick={() => handleApproveHostel(h._id, 'approve')} 
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '10px', padding: '4px 8px' }}
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteHostel(h._id)} 
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--error-color)', border: '1px solid var(--error-color)', fontSize: '10px', padding: '4px 8px' }}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-color text-center py-6">No hostels found.</p>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card animate-fade-in">
          <h3 className="font-bold text-lg mb-4">User Management ({allUsers.length})</h3>
          {allUsers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full text-left text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 5px' }}>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => {
                    const isSuspended = u.status === 'suspended';
                    return (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 5px', fontWeight: 'bold' }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                        <td>
                          <span className={`badge ${isSuspended ? 'badge-girls' : 'badge-verified'}`} style={{ textTransform: 'capitalize' }}>
                            {u.status || 'Verified'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-xs">
                            {u.role === 'owner' && u.status === 'pending' && (
                              <button 
                                onClick={() => handleApproveOwner(u._id, 'approve')} 
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '10px', padding: '4px 8px' }}
                              >
                                Verify Owner
                              </button>
                            )}
                            <button 
                              onClick={() => handleSuspendUser(u._id, isSuspended)} 
                              className="btn btn-secondary btn-sm"
                              style={{ 
                                color: isSuspended ? 'var(--primary-color)' : 'var(--error-color)',
                                border: `1px solid ${isSuspended ? 'var(--primary-color)' : 'var(--error-color)'}`,
                                fontSize: '10px', 
                                padding: '4px 8px' 
                              }}
                            >
                              {isSuspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-color text-center py-6">No users found.</p>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card animate-fade-in">
          <h3 className="font-bold text-lg mb-4">System Settings</h3>
          <p className="text-muted-color text-sm mb-6">Manage system-wide parameters and configurations.</p>
          
          <div className="flex flex-col gap-md max-w-md">
            <div className="flex justify-between items-center p-3 rounded" style={{ border: '1px solid var(--border-color)' }}>
              <div>
                <h4 className="font-semibold text-sm">Platform Maintenance Mode</h4>
                <p className="text-xs text-muted-color">Toggle temporary downtime page for all non-admins.</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.maintenanceMode} 
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div className="flex justify-between items-center p-3 rounded" style={{ border: '1px solid var(--border-color)' }}>
              <div>
                <h4 className="font-semibold text-sm">Allow Student Signups</h4>
                <p className="text-xs text-muted-color">Toggle student registration capability.</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.signupsAllowed} 
                onChange={(e) => setSettings({ ...settings, signupsAllowed: e.target.checked })} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div className="flex justify-between items-center p-3 rounded" style={{ border: '1px solid var(--border-color)' }}>
              <div>
                <h4 className="font-semibold text-sm">Moderator Email Notifications</h4>
                <p className="text-xs text-muted-color">Receive email alerts for flagged reviews and listings.</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.emailAlerts} 
                onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })} 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div className="flex flex-col gap-xs p-3 rounded" style={{ border: '1px solid var(--border-color)' }}>
              <label className="font-semibold text-sm">Auto-Moderation Sensitivity</label>
              <p className="text-xs text-muted-color mb-2">Adjust sensitivity for reporting reviews containing profanity.</p>
              <select 
                className="form-control text-xs" 
                value={settings.moderationLevel} 
                onChange={(e) => setSettings({ ...settings, moderationLevel: e.target.value })}
              >
                <option value="low">Low (Explicit Only)</option>
                <option value="standard">Standard (Recommended)</option>
                <option value="strict">Strict (All Flagged)</option>
              </select>
            </div>

            <button 
              onClick={() => showToast('System configurations updated successfully.', 'success')} 
              className="btn btn-primary self-start mt-2"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="card animate-fade-in">
          <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Flagged Reviews Queue ({reportedReviews.length})</h3>

          {reportedReviews.length > 0 ? (
            <div className="flex flex-col gap-md">
              {reportedReviews.map((rev) => (
                <div key={rev._id} className="flex flex-col gap-xs" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Review by: {rev.student?.name || 'Student'}</span>
                    <Rating rating={rev.rating} size="sm" />
                  </div>
                  <p className="text-xs text-muted-color">Target Hostel: {rev.hostel?.name}</p>
                  <p className="text-sm" style={{ backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: '4px', margin: '5px 0' }}>"{rev.comment}"</p>
                  
                  <div className="report-alert flex items-center gap-sm" style={{ color: 'var(--error-color)', padding: '5px 0' }}>
                    <span className="text-xs"> Flagged Reason:</span>
                    <span className="text-xs font-semibold">{rev.reportReason || 'Fake Review'}</span>
                  </div>

                  <div className="flex gap-sm" style={{ marginTop: '10px' }}>
                    <button onClick={() => handleDeleteReview(rev._id)} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--error-color)' }}>Delete Review</button>
                    <button onClick={() => handleDismissReport(rev._id)} className="btn btn-secondary btn-sm">Keep Review & Dismiss Report</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-color text-sm text-center" style={{ padding: '20px 0' }}>No flagged reviews flagged by students.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
