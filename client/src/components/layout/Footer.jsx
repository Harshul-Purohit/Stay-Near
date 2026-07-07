import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const defaultQuickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Search Hostels', path: '/search' },
  { label: 'Compare Properties', path: '/compare' },
  { label: 'Student Login', path: '/login' },
];

const defaultContact = [
  { label: 'JECRC University Campus, Sitapura, Jaipur' },
  { label: 'Support Helpline: +91 98765 43210' },
  { label: 'Email Support: help@staynear.in' },
];

const Footer = ({
  companyName = 'StayNear',
  description = 'Simplifying hostel and PG discovery for university students. Direct comparison, verified listings, and student-powered reviews.',
  launchedFor = 'JECRC University, Jaipur',
  quickLinks = defaultQuickLinks,
  contactInfo = defaultContact,
  className = '',
}) => {
  return (
    <footer className={`footer ${className}`} style={{ backgroundColor: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)' }}>
      <div className="container footer-grid grid">
        <div className="footer-brand flex flex-col">
          <h3 className="text-headline-md footer-title" style={{ color: 'var(--md-sys-color-on-primary)' }}> {companyName}</h3>
          <p className="text-body-md" style={{ color: 'var(--md-sys-color-outline-variant)' }}>
            {description}
          </p>
          <p className="text-label-sm signature-text" style={{ color: 'var(--md-sys-color-outline)' }}>
            Exclusively launched for <strong>{launchedFor}</strong>.
          </p>
        </div>

        <div className="footer-links flex flex-col">
          <h4 className="text-label-md footer-subtitle" style={{ color: 'var(--md-sys-color-on-primary)' }}>Quick Links</h4>
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path} className="text-body-md" style={{ color: 'var(--md-sys-color-outline-variant)', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-contact flex flex-col">
          <h4 className="text-label-md footer-subtitle" style={{ color: 'var(--md-sys-color-on-primary)' }}>Get in Touch</h4>
          {contactInfo.map((info, index) => (
            <p key={index} className="text-body-md" style={{ color: 'var(--md-sys-color-outline-variant)' }}>
              {info.label}
            </p>
          ))}
        </div>
      </div>
      <div className="footer-bottom text-center text-label-sm" style={{ borderTop: '1px solid var(--md-sys-color-outline)', paddingTop: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--md-sys-color-outline-variant)' }}>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        <p className="accessibility-notice" style={{ color: 'var(--md-sys-color-outline)' }}>
          {companyName} complies with WCAG accessibility principles for standard color contrasts and keyboard layouts.
        </p>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  companyName: PropTypes.string,
  description: PropTypes.string,
  launchedFor: PropTypes.string,
  quickLinks: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
  contactInfo: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
};

export default Footer;
