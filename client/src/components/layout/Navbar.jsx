import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import PropTypes from 'prop-types';

const Navbar = ({ logoText = 'StayNear', className = '' }) => {
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
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className={`navbar ${className}`} style={{ backgroundColor: 'var(--md-sys-color-surface)', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
      <div className="container navbar-container flex items-center justify-between">
        <Link to="/" className="navbar-logo flex items-center text-headline-md" style={{ color: 'var(--md-sys-color-primary)' }}>
          <span className="logo-icon" aria-hidden="true"></span> {logoText}
        </Link>

        {/* Hamburger Icon for Mobile */}
        <button 
          className="navbar-hamburger" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'bar-open' : ''}`}></span>
        </button>

        {/* Nav Links */}
        <ul className={`navbar-links flex items-center ${mobileMenuOpen ? 'navbar-links-open' : ''}`}>
          <li>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="nav-link text-body-md" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Search Hostels
            </Link>
          </li>
          <li>
            <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="nav-link flex items-center gap-xs text-body-md" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Compare 
              {compareList.length > 0 && (
                <span className="compare-badge text-label-sm" aria-label={`${compareList.length} items to compare`}>{compareList.length}</span>
              )}
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="nav-link text-label-md" style={{ color: 'var(--md-sys-color-primary-container)' }}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel ({user.name.split(' ')[0]})
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary text-label-md">
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="nav-link text-body-md" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn btn-sm btn-primary text-label-md">
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

Navbar.propTypes = {
  logoText: PropTypes.string,
  className: PropTypes.string,
};

export default Navbar;
