import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/dashboard/${user.role}`;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container flex items-center justify-between">
        <Link to="/" className="navbar-logo flex items-center font-bold text-xl">
          <span className="logo-icon"></span> StayNear
        </Link>

        {/* Hamburger Icon for Mobile */}
        <button 
          className="navbar-hamburger" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
        </button>

        {/* Nav Links */}
        <ul className={`navbar-links flex items-center ${mobileMenuOpen ? 'navbar-links-open' : ''}`}>
          <li>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Search Hostels
            </Link>
          </li>
          <li>
            <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="nav-link flex items-center gap-xs">
              Compare 
              {compareList.length > 0 && (
                <span className="compare-badge">{compareList.length}</span>
              )}
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="nav-link font-medium">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel ({user.name.split(' ')[0]})
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="nav-link">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn btn-sm btn-primary">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
