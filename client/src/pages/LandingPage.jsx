import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import HostelCard from '../components/HostelCard';
import SkeletonLoader from '../components/SkeletonLoader';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/hostels?limit=3');
        if (res.data.success && res.data.hostels.length > 0) {
          setFeaturedHostels(res.data.hostels.slice(0, 3));
        } else {
          // Fallback to high-quality mockup data if database is empty on first boot
          setFeaturedHostels([
            {
              _id: 'mock1',
              name: 'Royal Heritage Student PG',
              genderType: 'boys',
              isVerified: true,
              rating: 4.8,
              reviewCount: 24,
              location: { address: 'Sitapura Industrial Area, Jaipur' },
              facilities: ['Wi-Fi', 'AC', 'Power Backup', 'Gym', 'Laundry'],
              roomTypes: [{ type: 'Single', price: 9500 }, { type: 'Double', price: 7500 }],
              images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600']
            },
            {
              _id: 'mock2',
              name: 'Shree Balaji Girls Residency',
              genderType: 'girls',
              isVerified: true,
              rating: 4.6,
              reviewCount: 18,
              location: { address: 'Near JECRC Main Gate, Jaipur' },
              facilities: ['Wi-Fi', 'RO Water', 'CCTV Security', '3 Meals Daily'],
              roomTypes: [{ type: 'Double', price: 6500 }, { type: 'Triple', price: 5500 }],
              images: ['https://images.unsplash.com/photo-1596276122653-651a3898309f?auto=format&fit=crop&q=80&w=600']
            },
            {
              _id: 'mock3',
              name: 'Apex Premium Co-living PG',
              genderType: 'co-ed',
              isVerified: true,
              rating: 4.9,
              reviewCount: 32,
              location: { address: 'JECRC University Road, Sitapura, Jaipur' },
              facilities: ['Wi-Fi', 'AC', 'Housekeeping', 'Gaming Room'],
              roomTypes: [{ type: 'Single', price: 12000 }, { type: 'Double', price: 9000 }],
              images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600']
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch featured hostels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (searchQuery) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
    if (genderFilter !== 'all') queryParams.push(`genderType=${genderFilter}`);
    
    navigate(`/search?${queryParams.join('&')}`);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero-section flex items-center">
        <div className="container hero-container grid">
          <div className="hero-content flex flex-col justify-center">
            <span className="hero-tagline badge badge-verified">✓ Verified Campus Housing</span>
            <h1 className="hero-title text-4xl font-bold">
              Find Your Perfect Student Hostel Near <span className="highlight-text">JECRC University</span>
            </h1>
            <p className="hero-desc text-lg text-muted-color">
              Skip the brokers and shady listings. Directly search, compare pricing, check weekly food menus, and read honest student reviews of hostels in Sitapura, Jaipur.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="hero-search-bar flex items-center card">
              <div className="search-input-group flex-1 flex items-center">
                <span className="search-icon"></span>
                <input
                  type="text"
                  placeholder="Search by PG name, location, landmarks..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-select-group">
                <select 
                  className="search-select"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="all">Any Gender</option>
                  <option value="boys">Boys Only</option>
                  <option value="girls">Girls Only</option>
                  <option value="co-ed">Co-Ed</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary hero-search-btn">
                Search PGs
              </button>
            </form>
          </div>
          
          <div className="hero-image-container flex justify-center items-center">
            <img 
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600" 
              alt="Cozy student living room space" 
              className="hero-image"
            />
          </div>
        </div>
      </header>

      {/* Featured Hostels Section */}
      <section className="featured-section container">
        <div className="section-header flex items-center justify-between">
          <div>
            <h2 className="section-title text-2xl font-bold">Featured verified Hostels</h2>
            <p className="section-subtitle text-sm text-muted-color">Handpicked, verified listings closest to campus</p>
          </div>
          <Link to="/search" className="btn btn-outline btn-sm">View All PGs</Link>
        </div>

        <div className="hostels-grid grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : (
            featuredHostels.map((hostel) => (
              <HostelCard key={hostel._id} hostel={hostel} />
            ))
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title text-2xl font-bold text-center">How StayNear Works</h2>
          <p className="section-subtitle text-sm text-muted-color text-center">Three simple steps to secure your student home</p>

          <div className="steps-grid grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginTop: '40px' }}>
            <div className="step-card card text-center flex flex-col items-center">
              <div className="step-icon"></div>
              <h3 className="font-semibold text-lg step-title">1. Search & Filter</h3>
              <p className="text-sm text-muted-color">
                Filter hostels near JECRC University by budget, gender requirements, room capacity, and required facilities like AC or gym.
              </p>
            </div>

            <div className="step-card card text-center flex flex-col items-center">
              <div className="step-icon"></div>
              <h3 className="font-semibold text-lg step-title">2. Side-by-Side Compare</h3>
              <p className="text-sm text-muted-color">
                Add up to 3 listings to compare pricing models, distance from university, and check weekly food menus transparently.
              </p>
            </div>

            <div className="step-card card text-center flex flex-col items-center">
              <div className="step-icon"></div>
              <h3 className="font-semibold text-lg step-title">3. Contact & Review</h3>
              <p className="text-sm text-muted-color">
                Directly view verified contact numbers to book a visit. Read review score histories and submit honest feedbacks of your own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why StayNear Section */}
      <section className="why-section container">
        <div className="why-grid grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '50px', alignItems: 'center' }}>
          <div className="why-image-container">
            <img 
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600" 
              alt="Group of JECRC university students laughing" 
              className="why-image"
            />
          </div>
          <div className="why-content flex flex-col gap-md">
            <h2 className="section-title text-2xl font-bold">Why Choose StayNear?</h2>
            <ul className="why-list flex flex-col gap-sm">
              <li className="flex gap-sm">
                <span className="check-icon">✓</span>
                <div>
                  <h4 className="font-semibold">Zero Brokerage Fees</h4>
                  <p className="text-sm text-muted-color">Deal directly with verified owners, ensuring the lowest lease rates without middleman cuts.</p>
                </div>
              </li>
              <li className="flex gap-sm">
                <span className="check-icon">✓</span>
                <div>
                  <h4 className="font-semibold">Verified Listings</h4>
                  <p className="text-sm text-muted-color">All listings undergo documents vetting by campus administration, removing the risk of fake advertisements.</p>
                </div>
              </li>
              <li className="flex gap-sm">
                <span className="check-icon">✓</span>
                <div>
                  <h4 className="font-semibold">Transparent Meal Menus</h4>
                  <p className="text-sm text-muted-color">Review weekly mess menus, food photos, and meal timings prior to booking your stay.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section text-center flex justify-center items-center">
        <div className="container cta-container card flex flex-col items-center">
          <h2 className="font-bold text-3xl">Are you a Hostel Owner?</h2>
          <p className="text-sm text-muted-color" style={{ maxWidth: '600px', margin: '15px 0' }}>
            List your PG or hostel, showcase facilities and room availability directly to students of JECRC University. Manage bookings and reply to reviews easily.
          </p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Register Your Hostel
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
