import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import HostelCard from '../components/HostelCard';
import SkeletonLoader from '../components/SkeletonLoader';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genderType, setGenderType] = useState(searchParams.get('genderType') || 'all');
  const [budget, setBudget] = useState(searchParams.get('budget') || '15000');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || 'all');
  const [selectedFacilities, setSelectedFacilities] = useState(
    searchParams.get('facilities') ? searchParams.get('facilities').split(',') : []
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const facilityOptions = [
    'Wi-Fi', 'AC', 'Gym', 'Laundry', 'Power Backup', 'RO Water', 'CCTV Security', '3 Meals Daily'
  ];

  const fetchHostels = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (genderType !== 'all') params.genderType = genderType;
      if (budget) params.budget = budget;
      if (roomType !== 'all') params.roomType = roomType;
      if (selectedFacilities.length > 0) params.facilities = selectedFacilities.join(',');
      if (sort) params.sort = sort;

      const res = await api.get('/hostels', { params });
      if (res.data.success) {
        setHostels(res.data.hostels);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  }, [search, genderType, budget, roomType, selectedFacilities, sort]);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  // Sync URL search params
  const applyFilters = () => {
    const params = {};
    if (search) params.search = search;
    if (genderType !== 'all') params.genderType = genderType;
    if (budget) params.budget = budget;
    if (roomType !== 'all') params.roomType = roomType;
    if (selectedFacilities.length > 0) params.facilities = selectedFacilities.join(',');
    if (sort) params.sort = sort;
    
    setSearchParams(params);
  };

  const handleFacilityChange = (fac) => {
    if (selectedFacilities.includes(fac)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== fac));
    } else {
      setSelectedFacilities([...selectedFacilities, fac]);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setGenderType('all');
    setBudget('15000');
    setRoomType('all');
    setSelectedFacilities([]);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="search-page-container container">
      <div className="search-header-row flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover Hostels & PGs</h1>
          <p className="text-sm text-muted-color">Showing verified student housing around JECRC University</p>
        </div>
        <div className="sort-group flex items-center gap-sm">
          <label htmlFor="sort-dropdown" className="text-sm font-medium text-muted-color">Sort By:</label>
          <select
            id="sort-dropdown"
            className="form-control"
            style={{ width: '180px', padding: '6px 12px' }}
            value={sort}
            onChange={(e) => { setSort(e.target.value); applyFilters(); }}
          >
            <option value="newest">Newest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="search-layout grid">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar card flex flex-col gap-lg">
          <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 className="font-semibold text-base">Filters</h3>
            <button onClick={handleResetFilters} className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>
              Reset All
            </button>
          </div>

          {/* Text Search inside filters */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-search">Search Name / Area</label>
            <input
              id="filter-search"
              type="text"
              className="form-control"
              placeholder="e.g. Sitapura"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Gender Filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-gender">Hostel Gender</label>
            <select
              id="filter-gender"
              className="form-control"
              value={genderType}
              onChange={(e) => setGenderType(e.target.value)}
            >
              <option value="all">Any Gender</option>
              <option value="boys">Boys Only</option>
              <option value="girls">Girls Only</option>
              <option value="co-ed">Co-Ed</option>
            </select>
          </div>

          {/* Room Capacity */}
          <div className="form-group">
            <label className="form-label" htmlFor="filter-room-capacity">Room Capacity</label>
            <select
              id="filter-room-capacity"
              className="form-control"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="all">Any sharing type</option>
              <option value="Single">Single Sharing</option>
              <option value="Double">Double Sharing</option>
              <option value="Triple">Triple Sharing</option>
            </select>
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
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {/* Facilities list */}
          <div className="form-group flex flex-col gap-sm">
            <span className="form-label">Facilities Included</span>
            <div className="facilities-checkboxes flex flex-col gap-xs">
              {facilityOptions.map((fac) => (
                <label key={fac} className="flex items-center gap-sm text-sm" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(fac)}
                    onChange={() => handleFacilityChange(fac)}
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                  {fac}
                </label>
              ))}
            </div>
          </div>

          <button onClick={applyFilters} className="btn btn-primary btn-lg">
            Apply Filters
          </button>
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
              <h3 className="font-bold text-lg">No Listings Found</h3>
              <p className="text-sm text-muted-color" style={{ maxWidth: '400px' }}>
                We couldn't find any hostels matching your specific filters. Try loosening your budget or searching by area.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
