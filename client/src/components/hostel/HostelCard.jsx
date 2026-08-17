import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import Rating from '../ui/Rating';
import { useCompare } from '../../context/CompareContext';
import { useWishlist } from '../../context/WishlistContext';

const HostelCard = ({ hostel }) => {
  const { compareList, addToCompare, removeFromCompare } = useCompare();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Find lowest price
  const getStartingPrice = () => {
    if (!hostel.roomTypes || hostel.roomTypes.length === 0) return 'N/A';
    const prices = hostel.roomTypes.map((r) => r.price);
    return Math.min(...prices).toLocaleString('en-IN');
  };

  const isComparing = compareList.some((h) => h._id === hostel._id);
  const isSaved = isInWishlist(hostel._id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (isComparing) {
      removeFromCompare(hostel._id);
    } else {
      addToCompare(hostel);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(hostel);
  };

  // Safe image display
  const displayImage = hostel.images && hostel.images.length > 0 
    ? hostel.images[0] 
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600'; // high quality hostel placeholder

  return (
    <div className="hostel-card card flex flex-col">
      <div className="hostel-card-img-container" style={{ position: 'relative' }}>
        <img src={displayImage} alt={hostel.name} className="hostel-card-img" />
        
        {/* Heart / Save Button */}
        <button
          onClick={handleWishlistClick}
          className="hostel-wishlist-badge-btn"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-fast)',
            color: isSaved ? 'var(--error-color)' : 'var(--md-sys-color-secondary)',
            fontSize: '18px',
            lineHeight: 1,
            zIndex: 2,
          }}
          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          {isSaved ? '♥' : '♡'}
        </button>

        {/* Gender Badge */}
        <span className={`hostel-gender-badge badge badge-${hostel.genderType}`}>
          {hostel.genderType}
        </span>

        {/* Verified Badge */}
        {hostel.isVerified && (
          <span className="hostel-verified-badge badge badge-verified">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="hostel-card-details flex flex-col flex-1">
        <h3 className="hostel-card-title">{hostel.name}</h3>
        <p className="hostel-card-address text-sm text-muted-color"> {hostel.location?.address}</p>
        
        <div className="hostel-card-rating-row flex items-center gap-sm">
          <Rating rating={hostel.rating} size="sm" />
          <span className="text-xs text-muted-color">({hostel.reviewCount || 0} reviews)</span>
        </div>

        <div className="hostel-card-facilities-row flex flex-wrap gap-xs">
          {hostel.facilities?.slice(0, 3).map((fac, index) => (
            <span key={index} className="facility-tag text-xs">
              {fac}
            </span>
          ))}
          {hostel.facilities?.length > 3 && (
            <span className="facility-tag text-xs">+{hostel.facilities.length - 3} more</span>
          )}
        </div>

        <div className="hostel-card-footer flex items-center justify-between">
          <div className="hostel-card-price">
            <span className="price-label text-xs text-muted-color">Starts from</span>
            <div className="price-val font-bold">₹{getStartingPrice()}<span className="price-period text-xs font-normal">/mo</span></div>
          </div>

          <div className="hostel-card-actions flex gap-sm">
            <button
              onClick={handleCompareClick}
              className={`btn btn-sm ${isComparing ? 'btn-primary' : 'btn-secondary'}`}
              aria-label={isComparing ? `Remove ${hostel.name} from comparison` : `Compare ${hostel.name}`}
            >
              {isComparing ? 'Comparing' : 'Compare'}
            </button>
            <Link to={`/hostel/${hostel._id}`} className="btn btn-sm btn-outline">
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(HostelCard);
