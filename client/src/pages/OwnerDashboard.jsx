import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Loader from '../components/ui/Loader';
import Tabs from '../components/ui/Tabs';
import ImageUpload from '../components/ui/ImageUpload';
import Rating from '../components/ui/Rating';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [hostels, setHostels] = useState([]);
  const [hostel, setHostel] = useState(null); // Active hostel being edited/created
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'

  // Form states (create/edit)
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
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

  // Active Tab
  const [activeTab, setActiveTab] = useState('hostels');

  const facilityOptions = [
    'Wi-Fi', 'AC', 'Gym', 'Laundry', 'Power Backup', 'RO Water', 'CCTV Security', '3 Meals Daily'
  ];

  const fetchOwnerHostels = useCallback(async () => {
    try {
      const res = await api.get('/hostels?all=true'); // get all including unverified
      if (res.data.success) {
        // filter by owner
        const owned = res.data.hostels.filter((h) => h.owner?._id === user._id || h.owner === user._id);
        setHostels(owned);
        
        // Fetch reviews for the first hostel by default if available
        if (owned.length > 0) {
          const detailRes = await api.get(`/hostels/${owned[0]._id}`);
          if (detailRes.data.success) {
            setReviews(detailRes.data.reviews || []);
          }
        }
      }
    } catch (err) {
      showToast('Failed to fetch dashboard listings.', 'error');
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

    fetchOwnerHostels();
  }, [user, navigate, fetchOwnerHostels]);

  const handleReviewsHostelChange = async (hostelId) => {
    if (!hostelId) return;
    try {
      const detailRes = await api.get(`/hostels/${hostelId}`);
      if (detailRes.data.success) {
        setReviews(detailRes.data.reviews || []);
      }
    } catch (err) {
      showToast('Failed to fetch reviews.', 'error');
    }
  };

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

  const resetForm = () => {
    setHostel(null);
    setName('');
    setAddress('');
    setDescription('');
    setContactNumber('');
    setWhatsappNumber('');
    setGenderType('boys');
    setFacilities([]);
    setRoomTypes([
      { type: 'Single', capacity: 1, price: 8000, available: true },
      { type: 'Double', capacity: 2, price: 6500, available: true }
    ]);
    setWeeklyMenu({
      monday: ['Poha', 'Dal Baati', 'Alloo Sabji'],
      tuesday: ['Idli', 'Rajma Chawal', 'Paneer Tikka'],
      wednesday: ['Paratha', 'Kadi Chawal', 'Mix Veg'],
      thursday: ['Upma', 'Chole Bhature', 'Veg Biryani'],
      friday: ['Sandwich', 'Dal Makhani', 'Shahi Paneer'],
      saturday: ['Puri Sabji', 'Khichdi', 'Kofta Curry'],
      sunday: ['Sprouts', 'Veg Pulao', 'Special Thali']
    });
  };

  const handleEditClick = (h) => {
    setHostel(h);
    setName(h.name);
    setAddress(h.location?.address || '');
    setDescription(h.description || '');
    setContactNumber(h.contactNumber || '');
    setWhatsappNumber(h.whatsappNumber || '');
    setGenderType(h.genderType || 'boys');
    setFacilities(h.facilities || []);
    if (h.roomTypes && h.roomTypes.length > 0) {
      setRoomTypes(h.roomTypes.map(rt => ({ ...rt })));
    }
    if (h.weeklyMenu) {
      setWeeklyMenu({ ...h.weeklyMenu });
    }
    setView('edit');
  };

  const handleDeleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to delete this hostel listing? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.delete(`/hostels/${hostelId}`);
      if (res.data.success) {
        showToast('Hostel listing deleted successfully!', 'success');
        fetchOwnerHostels();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete hostel.', 'error');
      setLoading(false);
    }
  };

  const handleSaveHostel = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      location: { address, lat: 26.7865, lng: 75.8725 },
      contactNumber,
      whatsappNumber,
      description,
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
        fetchOwnerHostels();
        setView('list');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save hostel details.', 'error');
      setLoading(false);
    }
  };

  const handleImageUpload = async (files, type) => {
    if (!hostel) {
      showToast('Please save the hostel details first before uploading images.', 'warning');
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    formData.append('type', type);

    try {
      setLoading(true);
      const res = await api.post(`/hostels/${hostel._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        showToast('Images uploaded successfully!', 'success');
        const updatedImages = res.data.images;
        const updatedHostel = {
          ...hostel,
          [type === 'food' ? 'foodImages' : 'images']: updatedImages,
        };
        setHostel(updatedHostel);
        setHostels(hostels.map(h => h._id === hostel._id ? updatedHostel : h));
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload images.', 'error');
    } finally {
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
      </div>

      <Tabs 
        activeTab={activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); setView('list'); }} 
        tabs={[
          { id: 'profile', label: 'My Profile' },
          { id: 'hostels', label: 'My Hostels' },
          { id: 'bookings', label: 'Booking Requests' },
          { id: 'reviews', label: 'Student Reviews' }
        ]} 
      />

      {activeTab === 'profile' && (
        <div className="card flex flex-col gap-md animate-fade-in">
          <h3 className="font-bold text-lg mb-2">Owner Profile & Settings</h3>
          <div className="form-group max-w-sm">
            <label className="form-label">Update Name</label>
            <input type="text" className="form-control" defaultValue={user.name} />
          </div>
          <div className="form-group max-w-sm">
            <label className="form-label">Contact Email</label>
            <input type="email" className="form-control" defaultValue={user.email} disabled />
          </div>
          <div className="form-group max-w-sm mt-2">
            <label className="form-label">Business Documents</label>
            <p className="text-xs text-muted-color mb-2">Upload Govt ID and Hostel License to verify your property.</p>
            <div className="flex gap-md">
              <ImageUpload label="Govt ID" onUpload={(files) => showToast('Document selected', 'success')} />
              <ImageUpload label="Business License" onUpload={(files) => showToast('Document selected', 'success')} />
            </div>
          </div>
          <button className="btn btn-primary mt-4 self-start" onClick={() => showToast('Profile updated successfully', 'success')}>Save Profile</button>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card animate-fade-in">
          <h3 className="font-bold text-lg mb-4">Incoming Booking Requests</h3>
          <div className="flex flex-col gap-md">
            <div className="booking-card flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded" style={{ border: '1px solid var(--border-color)' }}>
              <div>
                <h4 className="font-bold text-md text-primary">Student: Rahul Kumar</h4>
                <p className="text-xs text-muted-color mt-1">Single Bed Sharing • Requested on {new Date().toLocaleDateString()}</p>
                <p className="text-sm font-medium mt-1">Move-in Date: {new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-sm mt-3 md:mt-0">
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Booking Approved', 'success')}>Approve</button>
                <button className="btn btn-secondary btn-sm" onClick={() => showToast('Booking Rejected', 'error')} style={{ color: 'var(--error-color)' }}>Reject</button>
              </div>
            </div>
            <div className="booking-card flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded bg-surface-container">
              <div>
                <h4 className="font-bold text-md text-primary">Student: Amit Singh</h4>
                <p className="text-xs text-muted-color mt-1">Double Bed Sharing • Requested on {new Date(new Date().setDate(new Date().getDate() - 2)).toLocaleDateString()}</p>
                <p className="text-sm font-medium mt-1">Move-in Date: {new Date(new Date().setDate(new Date().getDate() + 10)).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end gap-xs mt-3 md:mt-0">
                <span className="badge badge-verified">Approved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hostels' && (
        <div className="animate-fade-in">
          {view === 'list' ? (
            <div className="flex flex-col gap-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">My Hostel Listings</h3>
                <button 
                  onClick={() => { resetForm(); setView('add'); }} 
                  className="btn btn-primary"
                >
                  + Add New Hostel
                </button>
              </div>

              {hostels.length > 0 ? (
                <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                  {hostels.map((h) => (
                    <div key={h._id} className="card flex flex-col justify-between" style={{ minHeight: '220px' }}>
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-primary">{h.name}</h4>
                          <span className={`badge ${h.isVerified ? 'badge-verified' : 'badge-girls'}`}>
                            {h.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-color mb-1">📍 {h.location?.address}</p>
                        <p className="text-xs font-semibold mb-2" style={{ textTransform: 'capitalize' }}>
                          Type: {h.genderType} • {h.roomTypes?.length || 0} Room Tiers
                        </p>
                        {h.description && (
                          <p className="text-xs text-secondary-color line-clamp-3 mb-3">
                            {h.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-sm mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <button 
                          onClick={() => handleEditClick(h)} 
                          className="btn btn-secondary btn-sm flex-1"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteHostel(h._id)} 
                          className="btn btn-sm flex-1"
                          style={{ color: 'var(--error-color)', border: '1px solid var(--error-color)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card text-center p-8">
                  <p className="text-muted-color mb-4">You have not registered any hostels yet.</p>
                  <button 
                    onClick={() => { resetForm(); setView('add'); }} 
                    className="btn btn-primary"
                  >
                    Register Your First Hostel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">
                  {view === 'edit' ? `Edit "${name}" Listing` : 'Register New Hostel / PG'}
                </h3>
                <button 
                  onClick={() => setView('list')} 
                  className="btn btn-secondary btn-sm"
                >
                  ← Back to List
                </button>
              </div>

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

                <div className="form-group">
                  <label className="form-label" htmlFor="hostel-description">Description</label>
                  <textarea
                    id="hostel-description"
                    className="form-control"
                    placeholder="Describe your hostel, house rules, nearby landmarks..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                  />
                </div>

                <div className="form-group grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
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
                    <label className="form-label" htmlFor="hostel-whatsapp">WhatsApp Contact Number</label>
                    <input
                      id="hostel-whatsapp"
                      type="text"
                      className="form-control"
                      placeholder="e.g. +91 9876543210"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
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

                {/* Upload Image Section - Only available in edit mode */}
                {view === 'edit' && hostel && (
                  <div className="weekly-menu-editor" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <h4 className="font-semibold text-sm" style={{ marginBottom: '10px' }}>Hostel Gallery Images</h4>
                    <div className="grid gap-md" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label className="form-label text-xs">Room & General Images</label>
                        <ImageUpload 
                          label="Upload Room Images" 
                          multiple={true} 
                          onUpload={(files) => handleImageUpload(files, 'room')} 
                        />
                        <div className="flex gap-xs flex-wrap mt-2">
                          {hostel.images?.map((img, idx) => (
                            <img key={idx} src={img} alt="room" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="form-label text-xs">Mess & Food Images</label>
                        <ImageUpload 
                          label="Upload Food Images" 
                          multiple={true} 
                          onUpload={(files) => handleImageUpload(files, 'food')} 
                        />
                        <div className="flex gap-xs flex-wrap mt-2">
                          {hostel.foodImages?.map((img, idx) => (
                            <img key={idx} src={img} alt="food" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '15px' }}>
                  {view === 'edit' ? 'Save Listing Modifications' : 'Register Hostel'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="dashboard-sidebar flex flex-col gap-lg animate-fade-in">
          <div className="card">
            <h3 className="font-bold text-lg" style={{ marginBottom: '15px' }}>Student Reviews & Feedbacks</h3>
            
            {hostels.length > 0 && (
              <div className="form-group mb-4">
                <label className="form-label text-xs">Select Hostel</label>
                <select 
                  className="form-control text-xs" 
                  onChange={(e) => handleReviewsHostelChange(e.target.value)}
                >
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
            )}

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
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
