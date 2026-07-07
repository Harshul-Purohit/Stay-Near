import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Loader from '../components/ui/Loader';
import Rating from '../components/ui/Rating';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states (create/edit)
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [genderType, setGenderType] = useState('boys');
  const [facilities, setFacilities] = useState([]);
  
  // Room Type lists
  const [roomTypes, setRoomTypes] = useState([
    { type: 'Single', capacity: 1, price: 8000, available: true },
    { type: 'Double', capacity: 2, price: 6500, available: true }
  ]);

  // Weekly Menu
  const [weeklyMenu, setWeeklyMenu] = useState({
    monday: ['Poha', 'Dal Baati', 'Alloo Sabji'],
    tuesday: ['Idli', 'Rajma Chawal', 'Paneer Tikka'],
    wednesday: ['Paratha', 'Kadi Chawal', 'Mix Veg'],
    thursday: ['Upma', 'Chole Bhature', 'Veg Biryani'],
    friday: ['Sandwich', 'Dal Makhani', 'Shahi Paneer'],
    saturday: ['Puri Sabji', 'Khichdi', 'Kofta Curry'],
    sunday: ['Sprouts', 'Veg Pulao', 'Special Thali']
  });

  // Reply states
  const [replyText, setReplyText] = useState('');
  const [replyingReviewId, setReplyingReviewId] = useState('');

  const facilityOptions = [
    'Wi-Fi', 'AC', 'Gym', 'Laundry', 'Power Backup', 'RO Water', 'CCTV Security', '3 Meals Daily'
  ];

  const fetchOwnerHostel = useCallback(async () => {
    try {
      const res = await api.get('/hostels?all=true'); // get all including unverified
      if (res.data.success) {
        // filter by owner
        const owned = res.data.hostels.find((h) => h.owner?._id === user._id || h.owner === user._id);
        if (owned) {
          setHostel(owned);
          setName(owned.name);
          setAddress(owned.location?.address || '');
          setContactNumber(owned.contactNumber || '');
          setGenderType(owned.genderType || 'boys');
          setFacilities(owned.facilities || []);
          if (owned.roomTypes && owned.roomTypes.length > 0) {
            setRoomTypes(owned.roomTypes);
          }
          if (owned.weeklyMenu) {
            setWeeklyMenu(owned.weeklyMenu);
          }

          // Fetch reviews
          const detailRes = await api.get(`/hostels/${owned._id}`);
          if (detailRes.data.success) {
            setReviews(detailRes.data.reviews || []);
          }
        }
      }
    } catch (err) {
      showToast('Failed to fetch dashboard listing.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'owner') {
      navigate(`/dashboard/${user.role}`);
      return;
    }

    fetchOwnerHostel();
  }, [user, navigate, fetchOwnerHostel]);

  const handleFacilityChange = (fac) => {
    if (facilities.includes(fac)) {
      setFacilities(facilities.filter((f) => f !== fac));
    } else {
      setFacilities([...facilities, fac]);
    }
  };

  const handleRoomFieldChange = (idx, field, val) => {
    const updated = [...roomTypes];
    updated[idx][field] = val;
    setRoomTypes(updated);
  };

  const handleAddRoomType = () => {
    setRoomTypes([...roomTypes, { type: 'Triple', capacity: 3, price: 5000, available: true }]);
  };

  const handleRemoveRoomType = (idx) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== idx));
  };

  const handleMenuChange = (day, idx, val) => {
    const dayMenu = [...weeklyMenu[day]];
    dayMenu[idx] = val;
    setWeeklyMenu({ ...weeklyMenu, [day]: dayMenu });
  };

  const handleSaveHostel = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      location: { address, lat: 26.7865, lng: 75.8725 },
      contactNumber,
      genderType,
      facilities,
      roomTypes,
      weeklyMenu,
    };

    try {
      let res;
      if (hostel) {
        // Edit existing listing
        res = await api.put(`/hostels/${hostel._id}`, payload);
      } else {
        // Create new listing
        res = await api.post('/hostels', payload);
      }

      if (res.data.success) {
        showToast(res.data.message || 'Hostel saved successfully!', 'success');
        setHostel(res.data.hostel);
        fetchOwnerHostel();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save hostel details.', 'error');
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e, reviewId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await api.put(`/reviews/${reviewId}`, {
        ownerReply: replyText
      });

      if (res.data.success) {
        showToast('Reply posted successfully!', 'success');
        setReviews(reviews.map((r) => r._id === reviewId ? { ...r, ownerReply: replyText } : r));
        setReplyText('');
        setReplyingReviewId('');
      }
    } catch (err) {
      showToast('Failed to post reply.', 'error');
    }
  };

  if (loading) return <Loader fullPage={true} />;

  return (
    <div className="dashboard-container container">
      <div className="dashboard-header flex justify-between items-center" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="text-2xl font-bold">Hostel Owner Dashboard</h1>
          <p className="text-sm text-muted-color">Manage listings, rooms, menus, and reviews</p>
        </div>
        {hostel && (
          <div className="flex gap-sm">
            <span className={`badge ${hostel.isVerified ? 'badge-verified' : 'badge-girls'}`}>
              Listing Status: {hostel.isVerified ? 'Verified' : 'Pending Admin Verification'}
            </span>
          </div>
        )}
      </div>

      <div className="dashboard-grid grid" style={{ gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
        {/* Hostel Listing Setup Form */}
        <main className="dashboard-main card">
          <h3 className="font-bold text-lg" style={{ marginBottom: '20px' }}>
            {hostel ? 'Edit Hostel Listing Details' : 'Register Your Hostel / PG'}
          </h3>

          <form onSubmit={handleSaveHostel} className="flex flex-col gap-lg">
            <div className="form-group">
              <label className="form-label" htmlFor="hostel-name">Hostel / PG Name</label>
              <input
                id="hostel-name"
                type="text"
                className="form-control"
                placeholder="e.g. Royal Boys Residency"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hostel-address">Physical Address</label>
              <input
                id="hostel-address"
                type="text"
                className="form-control"
                placeholder="e.g. Plot 15, Sitapura Main Road, Jaipur"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label className="form-label" htmlFor="hostel-contact">Helpline Contact Number</label>
                <input
                  id="hostel-contact"
                  type="text"
                  className="form-control"
                  placeholder="e.g. +91 9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="hostel-gender">Hostel Gender Allowed</label>
                <select
                  id="hostel-gender"
                  className="form-control"
                  value={genderType}
                  onChange={(e) => setGenderType(e.target.value)}
                >
                  <option value="boys">Boys Only</option>
                  <option value="girls">Girls Only</option>
                  <option value="co-ed">Co-Ed</option>
                </select>
              </div>
            </div>

            {/* Room Options */}
            <div className="room-options-editor" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
                <h4 className="font-semibold text-sm">Room Sharing Tiers & Pricing</h4>
                <button type="button" onClick={handleAddRoomType} className="btn btn-secondary btn-sm">+ Add Tier</button>
              </div>

              <div className="flex flex-col gap-sm">
                {roomTypes.map((room, idx) => (
                  <div key={idx} className="flex gap-sm items-center flex-wrap" style={{ backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: '4px' }}>
                    <input
                      type="text"
                      className="form-control flex-1"
                      placeholder="Room label (e.g. Single)"
                      value={room.type}
                      onChange={(e) => handleRoomFieldChange(idx, 'type', e.target.value)}
                      style={{ minWidth: '100px' }}
                      required
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Price"
                      value={room.price}
                      onChange={(e) => handleRoomFieldChange(idx, 'price', Number(e.target.value))}
                      style={{ width: '100px' }}
                      required
                    />
                    <select
                      className="form-control"
                      value={room.available ? 'yes' : 'no'}
                      onChange={(e) => handleRoomFieldChange(idx, 'available', e.target.value === 'yes')}
                      style={{ width: '100px' }}
                    >
                      <option value="yes">Available</option>
                      <option value="no">Full</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveRoomType(idx)} className="text-xs font-semibold" style={{ color: 'var(--error-color)' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities Checkboxes */}
            <div className="facilities-editor" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <h4 className="font-semibold text-sm" style={{ marginBottom: '10px' }}>Select Included Facilities</h4>
              <div className="grid gap-sm" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                {facilityOptions.map((fac) => (
                  <label key={fac} className="flex items-center gap-sm text-sm" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={facilities.includes(fac)}
                      onChange={() => handleFacilityChange(fac)}
                    />
                    {fac}
                  </label>
                ))}
              </div>
            </div>

            {/* Weekly mess menu */}
            <div className="weekly-menu-editor" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <h4 className="font-semibold text-sm" style={{ marginBottom: '10px' }}>Mess Food Schedule</h4>
              <div className="flex flex-col gap-sm">
                {Object.keys(weeklyMenu).map((day) => (
                  <div key={day} className="flex gap-sm items-center flex-wrap">
                    <span className="text-xs font-semibold" style={{ width: '80px', textTransform: 'capitalize' }}>{day}:</span>
                    <input
                      type="text"
                      className="form-control flex-1"
                      placeholder="e.g. Poha, Dal Baati, Veg Thali"
                      value={weeklyMenu[day]?.[0] || ''}
                      onChange={(e) => handleMenuChange(day, 0, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '15px' }}>
              {hostel ? 'Save Listing Modifications' : 'Register Hostel'}
            </button>
          </form>
        </main>

        {/* Reviews and replies panel */}
        <aside className="dashboard-sidebar flex flex-col gap-lg">
          <div className="card">
            <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Student Reviews & Feedbacks</h3>
            
            {reviews.length > 0 ? (
              <div className="flex flex-col gap-md">
                {reviews.map((rev) => (
                  <div key={rev._id} className="review-dashboard-item flex flex-col gap-sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{rev.student?.name}</span>
                      <Rating rating={rev.rating} size="sm" />
                    </div>
                    <p className="text-xs text-secondary-color">"{rev.comment}"</p>
                    
                    {rev.ownerReply ? (
                      <div className="owner-reply" style={{ backgroundColor: 'var(--bg-color)', padding: '8px', borderRadius: '4px', borderLeft: '2px solid var(--primary-color)' }}>
                        <span className="text-xs font-semibold text-muted-color">Your Reply:</span>
                        <p className="text-xs">{rev.ownerReply}</p>
                      </div>
                    ) : replyingReviewId === rev._id ? (
                      <form onSubmit={(e) => handleReplySubmit(e, rev._id)} className="flex flex-col gap-sm">
                        <textarea
                          rows="2"
                          className="form-control text-xs"
                          placeholder="Type your response to student feedback..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          required
                        ></textarea>
                        <div className="flex gap-sm">
                          <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '10px', padding: '4px 8px' }}>Submit</button>
                          <button type="button" onClick={() => setReplyingReviewId('')} className="btn btn-secondary btn-sm" style={{ fontSize: '10px', padding: '4px 8px' }}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => { setReplyingReviewId(rev._id); setReplyText(''); }} 
                        className="text-xs font-semibold" 
                        style={{ color: 'var(--primary-color)', alignSelf: 'flex-start' }}
                      >
                        Reply to Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-color text-center text-sm" style={{ padding: '20px 0' }}>
                No reviews received yet on your hostel listing.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OwnerDashboard;
