import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import Rating from '../components/ui/Rating';
import Button from '../components/ui/Button';

const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  const getStartingPrice = (hostel) => {
    if (!hostel.roomTypes || hostel.roomTypes.length === 0) return 'N/A';
    const prices = hostel.roomTypes.map((r) => r.price);
    return Math.min(...prices);
  };

  const getRoomOptions = (hostel) => {
    if (!hostel.roomTypes || hostel.roomTypes.length === 0) return 'None';
    return hostel.roomTypes.map((r) => `${r.type} Sharing`).join(', ');
  };

  if (compareList.length === 0) {
    return (
      <div className="container text-center" style={{ padding: '80px 20px', minHeight: '60vh' }}>
        <span style={{ fontSize: '48px' }}></span>
        <h2 style={{ marginTop: '20px' }}>Your Comparison List is Empty</h2>
        <p className="text-muted-color" style={{ margin: '10px 0 20px 0' }}>
          Add hostels directly from the Search Results page to compare them side-by-side.
        </p>
        <Link to="/search" className="btn btn-primary">Find Hostels</Link>
      </div>
    );
  }

  const allFacilities = Array.from(
    new Set(compareList.flatMap((h) => h.facilities || []))
  );

  return (
    <div className="compare-page container">
      <div className="compare-header flex justify-between items-center" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="text-headline-md font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>Compare Hostels & PGs</h1>
          <p className="text-body-md" style={{ color: 'var(--md-sys-color-outline)' }}>Side-by-side comparison of your selected listings</p>
        </div>
        <Button onClick={clearCompare} variant="secondary">
          Clear All ({compareList.length})
        </Button>
      </div>

      <div className="compare-table-wrapper card" style={{ padding: '0', overflowX: 'auto' }}>
        <table className="compare-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
              <th style={{ width: '200px', padding: '16px', fontWeight: '600', textAlign: 'left' }}>Features</th>
              {compareList.map((hostel) => (
                <th key={hostel._id} style={{ padding: '16px', minWidth: '220px', textAlign: 'center' }}>
                  <div className="flex flex-col items-center gap-xs">
                    <img 
                      src={hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=200'} 
                      alt="" 
                      style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                    />
                    <span className="font-bold text-sm" style={{ display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hostel.name}
                    </span>
                    <div className="flex gap-xs items-center">
                      <span className={`badge badge-${hostel.genderType}`} style={{ fontSize: '10px' }}>{hostel.genderType}</span>
                      {hostel.isVerified && <span className="badge badge-verified" style={{ fontSize: '10px' }}>✓ Verified</span>}
                    </div>
                    <Button 
                      onClick={() => removeFromCompare(hostel._id)} 
                      variant="outline"
                      className="text-xs" 
                      style={{ marginTop: '5px' }}
                    >
                      Remove
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price Row */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px', fontWeight: '500' }}>Starting Price</td>
              {compareList.map((h) => (
                <td key={h._id} style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--primary-color)' }}>
                  ₹{getStartingPrice(h).toLocaleString('en-IN')}/mo
                </td>
              ))}
            </tr>

            {/* Room Options Row */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px', fontWeight: '500' }}>Room Layouts</td>
              {compareList.map((h) => (
                <td key={h._id} style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>
                  {getRoomOptions(h)}
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px', fontWeight: '500' }}>Student Rating</td>
              {compareList.map((h) => (
                <td key={h._id} style={{ padding: '16px', textAlign: 'center' }}>
                  <div className="flex flex-col items-center">
                    <Rating rating={h.rating} size="sm" />
                    <span className="text-xs text-muted-color">({h.reviewCount || 0} reviews)</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Location Address Row */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px', fontWeight: '500' }}>Address</td>
              {compareList.map((h) => (
                <td key={h._id} style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {h.location?.address}
                </td>
              ))}
            </tr>

            {/* Meal Times Row */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '16px', fontWeight: '500' }}>Meal Timings</td>
              {compareList.map((h) => (
                <td key={h._id} style={{ padding: '16px', textAlign: 'center', fontSize: '13px' }}>
                  Breakfast: {h.mealTimings?.breakfast || 'Standard'}<br/>
                  Dinner: {h.mealTimings?.dinner || 'Standard'}
                </td>
              ))}
            </tr>

            {/* Amenities Checklist Comparison */}
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <td colSpan={compareList.length + 1} style={{ padding: '10px 16px', fontWeight: '600', fontSize: '14px' }}>
                Amenity Comparison Checklist
              </td>
            </tr>

            {allFacilities.map((fac) => (
              <tr key={fac} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px' }}>{fac}</td>
                {compareList.map((h) => {
                  const hasFacility = h.facilities?.includes(fac);
                  return (
                    <td key={h._id} style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span 
                        style={{ 
                          color: hasFacility ? 'var(--success-color)' : 'var(--error-color)',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}
                      >
                        {hasFacility ? '✓' : '✗'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
