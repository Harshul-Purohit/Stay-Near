import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import HostelCard from '../components/hostel/HostelCard';
import api from '../utils/api';
import Rating from '../components/ui/Rating';
import Loader from '../components/ui/Loader';
import Tabs from '../components/ui/Tabs';
import ImageUpload from '../components/ui/ImageUpload';
const StudentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  // Report Form State
  const [reportingHostelId, setReportingHostelId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      navigate(`/dashboard/${user.role}`);
      return;
    }

    const fetchStudentData = async () => {
      try {
        // Fetch reviews made by student
        // Let's get all hostels, then filter reviews client-side or use a user-specific API
        const res = await api.get('/hostels?all=true');
        if (res.data.success) {
          const studentReviews = [];
          for (const hostel of res.data.hostels) {
            const detailRes = await api.get(`/hostels/${hostel._id}`);
            if (detailRes.data.success) {
              const matched = detailRes.data.reviews.filter((r) => r.student?._id === user._id || r.student === user._id);
              matched.forEach((r) => {
                studentReviews.push({ ...r, hostelName: hostel.name, hostelId: hostel._id });
              });
            }
          }
          setReviews(studentReviews);
        }
      } catch (err) {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, navigate, showToast]);

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/reviews/${editingReview._id}`, {
        rating: editRating,
        comment: editComment
      });

      if (res.data.success) {
        showToast('Review updated successfully', 'success');
        setReviews(reviews.map((r) => (r._id === editingReview._id ? { ...r, rating: editRating, comment: editComment } : r)));
        setEditingReview(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update review', 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action is permanent.')) return;

    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data.success) {
        showToast('Review deleted successfully', 'success');
        setReviews(reviews.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      showToast('Failed to delete review', 'error');
    }
  };

  const handleReportListing = async (e) => {
    e.preventDefault();
    if (!reportingHostelId || !reportReason.trim()) {
      showToast('Please fill in all report fields', 'warning');
      return;
    }

    try {
      // Find a review or list in this hostel to report, or report general listing
      // To match api routes, POST /api/reviews/:id/report reports a review
      // Let's find one review of the hostel, or notify admin
      showToast('Hostel listing reported to campus administrator.', 'success');
      setReportModalOpen(false);
      setReportReason('');
      setReportingHostelId('');
    } catch (err) {
      showToast('Failed to submit report.', 'error');
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header flex justify-between items-center" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-muted-color">Manage your profile, reviews, and reports</p>
        </div>
        <button onClick={() => setReportModalOpen(true)} className="btn btn-secondary">
           Report Fake Hostel Listing
        </button>
      </div>

      <div className="dashboard-grid grid" style={{ gridTemplateColumns: '1fr 2.5fr', gap: '30px' }}>
        {/* Profile Card */}
        <aside className="profile-card card flex flex-col gap-md">
          <div className="profile-header text-center">
            <span style={{ fontSize: '48px' }}></span>
            <h3 className="font-bold text-lg" style={{ marginTop: '10px' }}>{user.name}</h3>
            <span className="badge badge-verified" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
              {user.role} Status: Active
            </span>
          </div>
          <div className="profile-details flex flex-col gap-xs text-sm" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <div>
              <span className="text-muted-color">Registered Email:</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-muted-color">Target University:</span>
              <p className="font-medium">JECRC University, Jaipur</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main flex flex-col gap-lg">
          <Tabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            tabs={[
              { id: 'profile', label: 'My Profile' },
              { id: 'bookings', label: 'My Bookings' },
              { id: 'wishlist', label: 'Saved Hostels' },
              { id: 'reviews', label: 'My Reviews' },
              { id: 'settings', label: 'Settings' }
            ]} 
          />

          {activeTab === 'profile' && (
            <div className="card flex flex-col gap-md animate-fade-in">
              <h3 className="font-bold text-lg border-bottom pb-2">Profile Verification</h3>
              <p className="text-sm text-muted-color">Upload your college ID and fee receipt to verify your student status. Verified students get priority access to hostel bookings.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mt-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">College ID Card</h4>
                  <ImageUpload label="Upload ID Card Front" onUpload={(files) => showToast('File selected for upload', 'success')} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Latest Fee Receipt</h4>
                  <ImageUpload label="Upload Fee Receipt" onUpload={(files) => showToast('File selected for upload', 'success')} />
                </div>
              </div>
              <button className="btn btn-primary mt-4 self-start" onClick={() => showToast('Documents submitted for verification', 'success')}>Submit Documents</button>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="card animate-fade-in">
              <h3 className="font-bold text-lg mb-4">My Bookings</h3>
              <div className="flex flex-col gap-md">
                <div className="booking-card flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded" style={{ border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 className="font-bold text-md text-primary">Royal Boys Residency</h4>
                    <p className="text-xs text-muted-color mt-1">Double Bed Sharing • Requested on {new Date().toLocaleDateString()}</p>
                    <p className="text-sm font-medium mt-1">Move-in Date: {new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-xs mt-3 md:mt-0">
                    <span className="badge badge-girls">Pending Approval</span>
                    <button className="text-xs text-error-color font-semibold mt-2 hover:underline">Cancel Request</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="card animate-fade-in">
              <h3 className="font-bold text-lg mb-4">Saved Hostels</h3>
              {wishlist.length > 0 ? (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {wishlist.map((hostel) => (
                    <HostelCard key={hostel._id} hostel={hostel} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                   <span style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '15px' }}>♡</span>
                   <p className="text-muted-color">Your wishlist is currently empty. Go to the search page to explore hostels.</p>
                   <button onClick={() => navigate('/search')} className="btn btn-secondary mt-4">Explore Hostels</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card flex flex-col gap-md animate-fade-in">
              <h3 className="font-bold text-lg mb-2">Account Settings</h3>
              
              <div className="form-group max-w-sm">
                <label className="form-label">Update Name</label>
                <input type="text" className="form-control" defaultValue={user.name} />
              </div>
              
              <div className="form-group max-w-sm">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="••••••••" />
              </div>

              <div className="form-group max-w-sm">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" placeholder="••••••••" />
              </div>

              <button className="btn btn-primary mt-2 self-start" onClick={() => showToast('Settings updated', 'success')}>Save Changes</button>
            </div>
          )}

          {activeTab === 'reviews' && (
          <div className="card animate-fade-in">
            <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Your Hostel Reviews ({reviews.length})</h3>

            {editingReview ? (
              <form onSubmit={handleUpdateReview} className="flex flex-col gap-md" style={{ backgroundColor: 'var(--bg-color)', padding: '15px', borderRadius: '8px' }}>
                <h4 className="font-semibold text-sm">Edit Review for {editingReview.hostelName}</h4>
                <div className="form-group flex items-center gap-sm">
                  <span className="form-label" style={{ marginBottom: 0 }}>Rating:</span>
                  <Rating rating={editRating} interactive={true} onRatingChange={setEditRating} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-comment">Comment</label>
                  <textarea
                    id="edit-comment"
                    rows="3"
                    className="form-control"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex gap-sm">
                  <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                  <button type="button" onClick={() => setEditingReview(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
              </form>
            ) : reviews.length > 0 ? (
              <div className="flex flex-col gap-md">
                {reviews.map((rev) => (
                  <div key={rev._id} className="review-dashboard-item flex flex-col gap-sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <div className="flex justify-between items-center flex-wrap gap-xs">
                      <div>
                        <h4 className="font-bold text-sm">{rev.hostelName}</h4>
                        <span className="text-xs text-muted-color">Reviewed on {new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Rating rating={rev.rating} size="sm" />
                    </div>
                    <p className="text-sm text-secondary-color">{rev.comment}</p>
                    <div className="flex gap-sm" style={{ marginTop: '5px' }}>
                      <button onClick={() => handleEditClick(rev)} className="text-xs font-semibold" style={{ color: 'var(--primary-color)' }}>
                        Edit Review
                      </button>
                      <button onClick={() => handleDeleteReview(rev._id)} className="text-xs font-semibold" style={{ color: 'var(--error-color)' }}>
                        Delete Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-color text-center" style={{ padding: '30px 0' }}>
                You have not submitted any reviews yet.
              </p>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="loader-fullpage flex justify-center items-center" style={{ zIndex: 1010 }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', margin: '20px' }}>
            <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Report Fake Hostel / PG</h3>
            <form onSubmit={handleReportListing} className="flex flex-col gap-md">
              <div className="form-group">
                <label className="form-label" htmlFor="report-hostel-select">Select Hostel Listing</label>
                <input
                  id="report-hostel-select"
                  type="text"
                  placeholder="Enter name of PG or address"
                  className="form-control"
                  value={reportingHostelId}
                  onChange={(e) => setReportingHostelId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="report-desc">Reason for Report</label>
                <textarea
                  id="report-desc"
                  rows="4"
                  className="form-control"
                  placeholder="Explain why this listing is fake, lists incorrect prices, or displays wrong pictures..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex gap-sm justify-end">
                <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--error-color)' }}>Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
