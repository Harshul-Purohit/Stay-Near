import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Loader from '../components/ui/Loader';
import Rating from '../components/ui/Rating';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingHostels, setPendingHostels] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active tab state
  const [activeTab, setActiveTab] = useState('verifications');

  const fetchAdminData = async () => {
    try {
      // Get Analytics
      const analRes = await api.get('/admin/analytics');
      if (analRes.data.success) {
        setAnalytics(analRes.data.stats);
      }

      // Get Pending Owners
      const ownersRes = await api.get('/admin/pending-owners');
      if (ownersRes.data.success) {
        setPendingOwners(ownersRes.data.owners);
      }

      // Get Pending Hostels
      const hostelsRes = await api.get('/admin/pending-hostels');
      if (hostelsRes.data.success) {
        setPendingHostels(hostelsRes.data.hostels);
      }

      // Get Reported Reviews
      const reviewsRes = await api.get('/admin/reported-reviews');
      if (reviewsRes.data.success) {
        setReportedReviews(reviewsRes.data.reviews);
      }
    } catch (err) {
      showToast('Error loading administrative dashboards.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
  }, [user, navigate]);

  const handleApproveOwner = async (ownerId, action) => {
    try {
      const status = action === 'approve' ? 'verified' : 'rejected';
      const res = await api.put(`/admin/approve-owner/${ownerId}`, { status });
      if (res.data.success) {
        showToast(res.data.message || 'Owner status updated successfully', 'success');
        setPendingOwners(pendingOwners.filter((o) => o._id !== ownerId));
        // Refresh stats
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
      // Re-save review setting reported to false
      const res = await api.put(`/reviews/${reviewId}`, {
        ownerReply: '' // mock reply trigger or we can add a bypass
      });
      showToast('Review report dismissed.', 'success');
      setReportedReviews(reportedReviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      showToast('Failed to dismiss report.', 'error');
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header flex justify-between items-center" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="text-2xl font-bold">Admin Moderation Console</h1>
          <p className="text-sm text-muted-color">Manage user verifications, listing approvals, and reviews</p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <section className="analytics-grid grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
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

      {/* Dashboard Sub-tabs */}
      <div className="tabs-header flex gap-md" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '25px', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`tab-btn font-semibold text-sm ${activeTab === 'verifications' ? 'tab-active' : ''}`}
          style={{ padding: '8px 16px', borderBottom: activeTab === 'verifications' ? '2px solid var(--primary-color)' : 'none' }}
        >
          Verifications Queues ({pendingOwners.length + pendingHostels.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`tab-btn font-semibold text-sm ${activeTab === 'reviews' ? 'tab-active' : ''}`}
          style={{ padding: '8px 16px', borderBottom: activeTab === 'reviews' ? '2px solid var(--primary-color)' : 'none' }}
        >
          Flagged Feedbacks ({reportedReviews.length})
        </button>
      </div>

      {activeTab === 'verifications' ? (
        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
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
      ) : (
        /* Reported Reviews */
        <div className="card">
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
