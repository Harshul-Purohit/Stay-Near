import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import Rating from '../components/ui/Rating';
import SkeletonLoader from '../components/ui/Skeleton';
import Breadcrumb from '../components/ui/Breadcrumb';
import Accordion from '../components/ui/Accordion';

const HostelDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Wishlist state
  const isWishlisted = hostel ? isInWishlist(hostel._id) : false;

  const handleWishlistToggle = () => {
    if (hostel) {
      toggleWishlist(hostel);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hostels/${id}`);
        if (res.data.success) {
          setHostel(res.data.hostel);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        showToast('Failed to load hostel details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, showToast]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Please enter a review comment.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await api.post(`/reviews/${id}`, {
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        showToast('Review submitted successfully!', 'success');
        setReviews([
          {
            ...res.data.review,
            student: { _id: user._id, name: user.name, email: user.email },
          },
          ...reviews,
        ]);
        setNewComment('');
        setNewRating(5);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px var(--spacing-md)' }}>
        <SkeletonLoader type="details" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="container text-center" style={{ padding: '80px 20px' }}>
        <h2>Hostel Not Found</h2>
        <p className="text-muted-color">The hostel listing you are looking for does not exist or has been removed.</p>
        <Link to="/search" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Search</Link>
      </div>
    );
  }

  // Safe images fallback
  const hostelImages = hostel.images && hostel.images.length > 0 
    ? hostel.images 
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className="hostel-details-page container" style={{ paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <Breadcrumb paths={[
        { label: 'Home', url: '/' },
        { label: 'Hostels', url: '/search' },
        { label: hostel.name, url: '#' }
      ]} />

      {/* Title Header */}
      <div className="details-header flex justify-between items-start flex-wrap gap-md mt-2">
        <div>
          <div className="flex items-center gap-sm flex-wrap">
            <h1 className="text-3xl font-bold">{hostel.name}</h1>
            <span className={`badge badge-${hostel.genderType}`}>{hostel.genderType}</span>
            {hostel.isVerified && <span className="badge badge-verified">✓ Verified</span>}
          </div>
          <p className="text-muted-color" style={{ marginTop: '5px' }}> {hostel.location?.address}</p>
        </div>
        
        <div className="flex items-center gap-md">
          <button 
            onClick={handleWishlistToggle}
            className="btn btn-secondary flex items-center justify-center rounded"
            style={{ width: '40px', height: '40px', padding: 0, color: isWishlisted ? 'var(--error-color)' : 'var(--text-muted)' }}
            title="Save to Wishlist"
          >
            <span style={{ fontSize: '24px', lineHeight: 1 }}>{isWishlisted ? '♥' : '♡'}</span>
          </button>
          <div className="details-rating-box card flex items-center gap-sm" style={{ padding: '10px 15px' }}>
            <span className="font-bold text-xl" style={{ color: '#ffb400' }}>★ {hostel.rating || '0.0'}</span>
            <span className="text-xs text-muted-color">({hostel.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Gallery & Quick Booking Form */}
      <div className="details-grid grid" style={{ gridTemplateColumns: '2.2fr 1fr', gap: '30px', marginTop: '20px' }}>
        {/* Gallery Component */}
        <div className="gallery-container flex flex-col gap-sm">
          <div className="active-img-wrapper card" style={{ padding: '0', height: '400px', overflow: 'hidden' }}>
            <img src={hostelImages[activeImageIndex]} alt={hostel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="thumbnails-wrapper flex gap-sm" style={{ overflowX: 'auto', padding: '5px 0' }}>
            {hostelImages.map((img, idx) => (
              <button
                key={idx}
                className={`thumbnail-btn card ${idx === activeImageIndex ? 'thumbnail-active' : ''}`}
                style={{ padding: '0', width: '80px', height: '60px', overflow: 'hidden', flexShrink: 0 }}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Booking Sidebar */}
        <aside className="booking-sidebar card flex flex-col gap-md">
          <h3 className="font-bold text-lg">Contact Owner</h3>
          <p className="text-sm text-muted-color">Connect with the owner to book a visit or ask questions.</p>
          
          {user ? (
            <>
              <div className="flex flex-col gap-md" style={{ backgroundColor: 'var(--bg-color)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="flex flex-col gap-xs">
                  <span className="text-xs font-semibold text-muted-color" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner Name</span>
                  <div className="font-medium text-sm text-primary-light">{hostel.owner?.name || 'Verified Owner'}</div>
                </div>
                
                <div className="flex flex-col gap-xs">
                  <span className="text-xs font-semibold text-muted-color" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</span>
                  <div className="font-semibold text-sm text-primary-light">{hostel.contactNumber || 'Not Available'}</div>
                </div>

                <div className="flex flex-col gap-xs">
                  <span className="text-xs font-semibold text-muted-color" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
                  <div className="font-medium text-sm text-primary-light">{hostel.owner?.email || 'Not Available'}</div>
                </div>

                <div className="flex flex-col gap-xs">
                  <span className="text-xs font-semibold text-muted-color" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp Number</span>
                  <div className="font-medium text-sm text-primary-light">{hostel.whatsappNumber || hostel.contactNumber || 'Not Available'}</div>
                </div>

                <div className="flex flex-col gap-xs">
                  <span className="text-xs font-semibold text-muted-color" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hostel Address</span>
                  <div className="font-medium text-sm text-primary-light">{hostel.location?.address || 'Not Available'}</div>
                </div>
              </div>

              <div className="flex flex-col gap-sm">
                {hostel.contactNumber && (
                  <a href={`tel:${hostel.contactNumber}`} className="btn btn-primary w-full justify-center flex items-center gap-sm">
                    <span>📞</span> Call Owner
                  </a>
                )}
                {hostel.owner?.email && (
                  <a href={`mailto:${hostel.owner.email}?subject=Inquiry about ${hostel.name}`} className="btn btn-secondary w-full justify-center flex items-center gap-sm">
                    <span>✉️</span> Email Owner
                  </a>
                )}
                {(hostel.whatsappNumber || hostel.contactNumber) && (
                  <a 
                    href={`https://wa.me/${(hostel.whatsappNumber || hostel.contactNumber).replace(/\D/g, '')}?text=Hi, I am interested in your hostel ${encodeURIComponent(hostel.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary w-full justify-center flex items-center gap-sm"
                    style={{ border: '1px solid #25D366', color: '#25D366' }}
                  >
                    <span>💬</span> WhatsApp Owner
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="login-to-view text-center flex flex-col gap-sm" style={{ backgroundColor: 'var(--surface-color)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p className="text-sm text-muted-color">Please log in to view the owner's contact details.</p>
              <Link to="/login" className="btn btn-primary w-full justify-center mt-2">Log In to View</Link>
            </div>
          )}

          <hr className="my-2" style={{ borderTop: '1px solid var(--border-color)' }} />

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${hostel.location?.lat},${hostel.location?.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary flex justify-center w-full"
          >
             View on Google Maps
          </a>
        </aside>
      </div>

      {/* Room Types & Pricing */}
      <section className="details-section" style={{ marginTop: '40px' }}>
        <h2 className="font-bold text-xl section-title">Room Options & Pricing</h2>
        <div className="room-types-grid grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
          {hostel.roomTypes?.map((room, idx) => (
            <div key={idx} className="card room-card flex flex-col gap-sm">
              <span className="font-semibold text-base">{room.type} Bed Sharing</span>
              <div className="price-val font-bold">₹{room.price.toLocaleString('en-IN')}<span className="price-period text-xs font-normal">/mo</span></div>
              <span className={`badge ${room.available ? 'badge-verified' : 'badge-girls'}`} style={{ alignSelf: 'flex-start', fontSize: '10px' }}>
                {room.available ? '● Available' : '● Full'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities & Amenities */}
      <section className="details-section" style={{ marginTop: '40px' }}>
        <h2 className="font-bold text-xl section-title">Facilities & Amenities</h2>
        <div className="facilities-detail-grid grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {hostel.facilities?.map((fac, idx) => (
            <div key={idx} className="card flex items-center gap-sm" style={{ padding: '12px 15px' }}>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>✓</span>
              <span className="text-sm font-medium">{fac}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mess Menu Accordion */}
      <section className="details-section" style={{ marginTop: '40px' }}>
        <Accordion title="Weekly Mess Food Menu" subtitle="View breakfast, lunch, and dinner timetables" icon="🍲">
          <div className="meal-timings-grid grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="text-center">
              <span className="font-semibold text-xs text-muted-color">Breakfast</span>
              <p className="text-sm font-medium">{hostel.mealTimings?.breakfast || '8:00 AM - 9:30 AM'}</p>
            </div>
            <div className="text-center">
              <span className="font-semibold text-xs text-muted-color">Lunch</span>
              <p className="text-sm font-medium">{hostel.mealTimings?.lunch || '1:00 PM - 2:30 PM'}</p>
            </div>
            <div className="text-center">
              <span className="font-semibold text-xs text-muted-color">Dinner</span>
              <p className="text-sm font-medium">{hostel.mealTimings?.dinner || '8:00 PM - 9:30 PM'}</p>
            </div>
          </div>
          
          <div className="menu-table-wrapper" style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table className="menu-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Day</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Items Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <tr key={day} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', textTransform: 'capitalize', fontWeight: '500' }}>{day}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      {hostel.weeklyMenu?.[day]?.join(', ') || 'Standard hosteler meals'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Accordion>
      </section>

      {/* Reviews & Ratings Section */}
      <section className="details-section" style={{ marginTop: '40px' }}>
        <h2 className="font-bold text-xl section-title">Student Reviews</h2>
        
        {/* Add Review Form */}
        {user && user.role === 'student' && (
          <form onSubmit={handleReviewSubmit} className="card flex flex-col gap-md" style={{ margin: '20px 0' }}>
            <h3 className="font-semibold text-base">Write a Review</h3>
            <div className="form-group flex items-center gap-md">
              <span className="form-label" style={{ marginBottom: '0' }}>Your Rating:</span>
              <Rating rating={newRating} interactive={true} onRatingChange={setNewRating} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-review-comment">Review Description</label>
              <textarea
                id="new-review-comment"
                rows="4"
                className="form-control"
                placeholder="Share your experience (food quality, hygiene, owner cooperative behavior)..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="reviews-list flex flex-col gap-md" style={{ marginTop: '20px' }}>
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev._id} className="card flex flex-col gap-sm">
                <div className="flex justify-between items-center flex-wrap gap-xs">
                  <div>
                    <span className="font-semibold text-sm">{rev.student?.name || 'Verified Student'}</span>
                    <div className="text-xs text-muted-color">{new Date(rev.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Rating rating={rev.rating} size="sm" />
                </div>
                <p className="text-sm text-secondary-color" style={{ marginTop: '5px' }}>{rev.comment}</p>
                
                {rev.ownerReply && (
                  <div className="owner-reply card" style={{ padding: '10px 15px', backgroundColor: 'var(--bg-color)', borderLeft: '3px solid var(--primary-color)', marginTop: '5px' }}>
                    <span className="font-semibold text-xs" style={{ color: 'var(--primary-color)' }}>Owner Reply:</span>
                    <p className="text-sm" style={{ marginTop: '2px' }}>{rev.ownerReply}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-color text-center" style={{ padding: '30px 0' }}>No student reviews yet. Be the first to leave a review!</p>
          )}
        </div>
      </section>

      {/* Similar Hostels (Mock UI) */}
      <section className="details-section" style={{ marginTop: '40px' }}>
        <h2 className="font-bold text-xl section-title mb-4">Similar Hostels Near JECRC</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[1,2,3].map((item) => (
             <div key={item} className="card flex flex-col gap-sm" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '160px', backgroundColor: 'var(--surface-variant)' }}>
                  <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=400" alt="Hostel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '15px' }} className="flex flex-col gap-xs">
                  <h4 className="font-bold text-md">Premium {hostel.genderType === 'girls' ? 'Girls' : 'Boys'} Residency</h4>
                  <p className="text-xs text-muted-color">0.5 km from campus</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-semibold text-primary">₹12,000<span className="text-xs font-normal text-muted-color">/mo</span></p>
                    <Link to="/search" className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>View</Link>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HostelDetailsPage;
