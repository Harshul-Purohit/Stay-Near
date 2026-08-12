import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import HostelCard from '../components/hostel/HostelCard';
import SkeletonLoader from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local text search input state (to prevent querying on every keystroke)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  // Local state synced with URL for other filters
  const genderType = searchParams.get('genderType') || 'all';
  const budget = searchParams.get('budget') || '15000';
  const roomType = searchParams.get('roomType') || 'all';
  const selectedFacilities = searchParams.get('facilities') ? searchParams.get('facilities').split(',') : [];
  const minRating = searchParams.get('rating') || '0';
  const acType = searchParams.get('acType') || 'all';
  const foodType = searchParams.get('foodType') || 'all';
  const sort = searchParams.get('sort') || 'newest';

  const facilityOptions = [
    'Wi-Fi', 'AC', 'Gym', 'Laundry', 'Power Backup', 'RO Water', 'CCTV Security', '3 Meals Daily'
  ];

  // Keep text search input in sync if URL param changes externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      const urlSearch = searchParams.get('search');
      const urlGenderType = searchParams.get('genderType');
      const urlBudget = searchParams.get('budget');
      const urlRoomType = searchParams.get('roomType');
      const urlFacilities = searchParams.get('facilities') ? searchParams.get('facilities').split(',') : [];
      const urlRating = searchParams.get('rating');
      const urlAcType = searchParams.get('acType') || 'all';
      const urlFoodType = searchParams.get('foodType') || 'all';
      const urlSort = searchParams.get('sort');

      if (urlSearch) params.search = urlSearch;
      if (urlGenderType && urlGenderType !== 'all') params.genderType = urlGenderType;
      if (urlBudget) params.budget = urlBudget;
      if (urlRoomType && urlRoomType !== 'all') params.roomType = urlRoomType;
      if (urlRating && urlRating !== '0') params.rating = urlRating;
      if (urlSort) params.sort = urlSort;

      // Build composite facilities list for backend query
      let compositeFacilities = [...urlFacilities];
      if (urlAcType === 'ac' && !compositeFacilities.includes('AC')) {
        compositeFacilities.push('AC');
      }
      if (urlFoodType === 'food' && !compositeFacilities.includes('3 Meals Daily')) {
        compositeFacilities.push('3 Meals Daily');
      }

      if (compositeFacilities.length > 0) {
        params.facilities = compositeFacilities.join(',');
      }

      const res = await api.get('/hostels', { params });
      if (res.data.success) {
        let results = res.data.hostels;

        // Perform client-side Non-AC filtering since backend only does positive match $all
        if (urlAcType === 'non-ac') {
          results = results.filter(h => !h.facilities?.includes('AC'));
        }

        setHostels(results);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  // General helper to update URL parameters reactive
  const updateQueryParam = (key, value) => {
    const nextParams = Object.fromEntries(searchParams.entries());
    if (value && value !== 'all' && value !== '0') {
      nextParams[key] = value;
    } else {
      delete nextParams[key];
    }
    setSearchParams(nextParams);
  };

  const handleFacilityChange = (fac) => {
    let nextFacilities;
    if (selectedFacilities.includes(fac)) {
      nextFacilities = selectedFacilities.filter((f) => f !== fac);
    } else {
      nextFacilities = [...selectedFacilities, fac];
    }
    
    const nextParams = Object.fromEntries(searchParams.entries());
    if (nextFacilities.length > 0) {
      nextParams.facilities = nextFacilities.join(',');
    } else {
      delete nextParams.facilities;
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParam('search', search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  const removeSpecificFilter = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (key === 'facilities') {
      const updated = selectedFacilities.filter(f => f !== value);
      if (updated.length > 0) {
        params.facilities = updated.join(',');
      } else {
        delete params.facilities;
      }
    } else {
      delete params[key];
    }
    setSearchParams(params);
  };

  const hasActiveFilters = 
    searchParams.get('search') || 
    (searchParams.get('genderType') && searchParams.get('genderType') !== 'all') || 
    searchParams.get('budget') || 
    (searchParams.get('roomType') && searchParams.get('roomType') !== 'all') || 
    searchParams.get('facilities') || 
    (searchParams.get('rating') && searchParams.get('rating') !== '0') ||
    (searchParams.get('acType') && searchParams.get('acType') !== 'all') ||
    (searchParams.get('foodType') && searchParams.get('foodType') !== 'all');

  return (
    <div className="search-page-container container">
      <div className="search-header-row flex items-center justify-between">
        <div>
          <h1 className="text-headline-md font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>Discover Hostels & PGs</h1>
          <p className="text-body-md" style={{ color: 'var(--md-sys-color-outline)' }}>Showing verified student housing around JECRC University</p>
        </div>
        <div className="sort-group flex items-center gap-sm">
          <label htmlFor="sort-dropdown" className="text-label-md font-medium text-muted-color">Sort By:</label>
          <Dropdown
            id="sort-dropdown"
            className="form-control"
            style={{ width: '180px', padding: '6px 12px' }}
            value={sort}
            onChange={(e) => updateQueryParam('sort', e.target.value)}
            options={[
              { label: 'Newest First', value: 'newest' },
              { label: 'Price: Low to High', value: 'priceAsc' },
              { label: 'Price: High to Low', value: 'priceDesc' },
              { label: 'Top Rated', value: 'rating' }
            ]}
          />
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="active-filters-bar flex gap-xs flex-wrap items-center mt-2 p-2 rounded bg-surface-container" style={{ gap: '10px' }}>
          <span className="text-xs font-semibold text-muted-color">Active Filters:</span>
          {searchParams.get('search') && (
            <span className="badge badge-girls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Search: "{searchParams.get('search')}"
              <button onClick={() => removeSpecificFilter('search')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          )}
          {searchParams.get('genderType') && searchParams.get('genderType') !== 'all' && (
            <span className="badge badge-girls" style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
              Gender: {searchParams.get('genderType')}
              <button onClick={() => removeSpecificFilter('genderType')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          )}
          {searchParams.get('roomType') && searchParams.get('roomType') !== 'all' && (
            <span className="badge badge-girls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Room: {searchParams.get('roomType')}
              <button onClick={() => removeSpecificFilter('roomType')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          )}
          {searchParams.get('rating') && searchParams.get('rating') !== '0' && (
            <span className="badge badge-girls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Rating: {searchParams.get('rating')}★+
              <button onClick={() => removeSpecificFilter('rating')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          )}
          {searchParams.get('acType') && searchParams.get('acType') !== 'all' && (
            <span className="badge badge-girls" style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
              AC: {searchParams.get('acType')}
              <button onClick={() => removeSpecificFilter('acType')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          )}
          {searchParams.get('foodType') && searchParams.get('foodType') !== 'all' && (
            <span className="badge badge-girls" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Food Included
              <button onClick={() => removeSpecificFilter('foodType')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          )}
          {selectedFacilities.map(f => (
            <span key={f} className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {f}
              <button onClick={() => removeSpecificFilter('facilities', f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
            </span>
          ))}
          <button onClick={handleResetFilters} className="text-xs font-bold" style={{ color: 'var(--error-color)', cursor: 'pointer', background: 'none', border: 'none' }}>
            Clear All
          </button>
        </div>
      )}

      <div className="search-layout grid" style={{ marginTop: '20px' }}>
        {/* Sidebar Filters */}
        <aside className="filters-sidebar card flex flex-col gap-lg">
          <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--md-sys-color-outline-variant)', paddingBottom: '10px' }}>
            <h3 className="font-semibold text-title-md" style={{ color: 'var(--md-sys-color-on-surface)' }}>Filters</h3>
            <Button variant="outline" onClick={handleResetFilters} className="text-label-md font-semibold" style={{ color: 'var(--md-sys-color-primary)' }}>
              Reset All
            </Button>
          </div>

          {/* Text Search inside filters */}
          <form onSubmit={handleSearchSubmit} className="form-group flex gap-xs items-end">
            <div className="flex-1">
              <label className="form-label" htmlFor="filter-search">Search Name / Area</label>
              <Input
                id="filter-search"
                type="text"
                placeholder="e.g. Sitapura"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" style={{ padding: '10px 14px' }}>Go</Button>
          </form>

          {/* Gender Filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-gender">Hostel Gender</label>
            <Dropdown
              id="filter-gender"
              className="form-control"
              value={genderType}
              onChange={(e) => updateQueryParam('genderType', e.target.value)}
              options={[
                { label: 'Any Gender', value: 'all' },
                { label: 'Boys Only', value: 'boys' },
                { label: 'Girls Only', value: 'girls' },
                { label: 'Co-Ed', value: 'co-ed' }
              ]}
            />
          </div>

          {/* Room Capacity */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-room-capacity">Room Sharing Tier</label>
            <Dropdown
              id="filter-room-capacity"
              className="form-control"
              value={roomType}
              onChange={(e) => updateQueryParam('roomType', e.target.value)}
              options={[
                { label: 'Any sharing type', value: 'all' },
                { label: 'Single Sharing', value: 'Single' },
                { label: 'Double Sharing', value: 'Double' },
                { label: 'Triple Sharing', value: 'Triple' }
              ]}
            />
          </div>

          {/* AC / Non-AC filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-ac-type">AC Feature</label>
            <Dropdown
              id="filter-ac-type"
              className="form-control"
              value={acType}
              onChange={(e) => updateQueryParam('acType', e.target.value)}
              options={[
                { label: 'AC & Non-AC Rooms', value: 'all' },
                { label: 'AC Rooms Only', value: 'ac' },
                { label: 'Non-AC Rooms Only', value: 'non-ac' }
              ]}
            />
          </div>

          {/* Food filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-food-type">Mess Food</label>
            <Dropdown
              id="filter-food-type"
              className="form-control"
              value={foodType}
              onChange={(e) => updateQueryParam('foodType', e.target.value)}
              options={[
                { label: 'Any (Food Optional)', value: 'all' },
                { label: '3 Meals Included', value: 'food' }
              ]}
            />
          </div>

          {/* Rating filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-rating">Minimum Rating</label>
            <Dropdown
              id="filter-rating"
              className="form-control"
              value={minRating}
              onChange={(e) => updateQueryParam('rating', e.target.value)}
              options={[
                { label: 'Show All Ratings', value: '0' },
                { label: '4.0★ & above', value: '4' },
                { label: '3.0★ & above', value: '3' },
                { label: '2.0★ & above', value: '2' }
              ]}
            />
          </div>

          {/* Budget Range Slider */}
          <div className="form-group">
            <div className="flex justify-between items-center" style={{ width: '100%' }}>
              <label className="form-label" htmlFor="filter-budget">Max Monthly Budget</label>
              <span className="font-bold text-sm" style={{ color: 'var(--primary-color)' }}>₹{Number(budget).toLocaleString('en-IN')}</span>
            </div>
            <input
              id="filter-budget"
              type="range"
              min="3000"
              max="20000"
              step="500"
              className="form-range"
              style={{ width: '100%', accentColor: 'var(--primary-color)', marginTop: '8px' }}
              value={budget}
              onChange={(e) => updateQueryParam('budget', e.target.value)}
            />
          </div>

          {/* Facilities list */}
          <div className="form-group flex flex-col gap-sm">
            <span className="form-label">Amenities / Facilities</span>
            <div className="facilities-checkboxes flex flex-col gap-xs">
              {facilityOptions.map((fac) => {
                if (fac === 'AC' || fac === '3 Meals Daily') return null;
                return (
                  <label key={fac} className="flex items-center gap-sm text-sm" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(fac)}
                      onChange={() => handleFacilityChange(fac)}
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    {fac}
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Results Listings Grid */}
        <main className="results-container flex flex-col gap-md">
          {loading ? (
            <div className="hostels-grid grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              <SkeletonLoader type="card" count={4} />
            </div>
          ) : hostels.length > 0 ? (
            <>
              <div className="results-count text-sm text-muted-color">
                We found <strong>{hostels.length}</strong> matching hostels
              </div>
              <div className="hostels-grid grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {hostels.map((hostel) => (
                  <HostelCard key={hostel._id} hostel={hostel} />
                ))}
              </div>
            </>
          ) : (
            /* Empty State Container */
            <div className="empty-state card text-center flex flex-col items-center gap-md">
              <span className="empty-icon" style={{ fontSize: '48px' }}>🔍</span>
              <h3 className="font-bold text-title-md">No Listings Found</h3>
              <p className="text-body-md" style={{ maxWidth: '400px', color: 'var(--md-sys-color-outline)' }}>
                We couldn't find any hostels matching your specific filters. Try loosening your budget or searching by area.
              </p>
              <Button onClick={handleResetFilters} variant="primary">
                Clear Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
