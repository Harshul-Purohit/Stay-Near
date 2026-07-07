import React from 'react';
import { Link } from 'react-router-dom';
import Rating from '../ui/Rating';
import { useCompare } from '../../context/CompareContext';

const HostelCard = ({ hostel }) => {
  const { compareList, addToCompare, removeFromCompare } = useCompare();

  // Find lowest price
  const getStartingPrice = () => {
    if (!hostel.roomTypes || hostel.roomTypes.length === 0) return 'N/A';
    const prices = hostel.roomTypes.map((r) => r.price);
    return Math.min(...prices).toLocaleString('en-IN');
  };

  const isComparing = compareList.some((h) => h._id === hostel._id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (isComparing) {
      removeFromCompare(hostel._id);
    } else {
      addToCompare(hostel);
    }
  };

  // Safe image display
  const displayImage = hostel.images && hostel.images.length > 0 
    ? hostel.images[0] 
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600'; // high quality hostel placeholder

  return (
    <div className="hostel-card card flex flex-col">
      <div className="hostel-card-img-container">
        <img src={displayImage} alt={hostel.name} className="hostel-card-img" />
        
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

export default HostelCard;
