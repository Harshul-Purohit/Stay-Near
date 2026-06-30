import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid grid">
        <div className="footer-brand flex flex-col">
          <h3 className="font-bold text-lg footer-title">🏡 StayNear</h3>
          <p className="text-sm text-muted-color">
            Simplifying hostel and PG discovery for university students. 
            Direct comparison, verified listings, and student-powered reviews.
          </p>
          <p className="text-xs text-muted-color signature-text">
            Exclusively launched for <strong>JECRC University, Jaipur</strong>.
          </p>
        </div>

        <div className="footer-links flex flex-col">
          <h4 className="font-semibold text-sm footer-subtitle">Quick Links</h4>
          <Link to="/" className="text-sm text-muted-color">Home</Link>
          <Link to="/search" className="text-sm text-muted-color">Search Hostels</Link>
          <Link to="/compare" className="text-sm text-muted-color">Compare Properties</Link>
          <Link to="/login" className="text-sm text-muted-color">Student Login</Link>
        </div>

        <div className="footer-contact flex flex-col">
          <h4 className="font-semibold text-sm footer-subtitle">Get in Touch</h4>
          <p className="text-sm text-muted-color">📍 JECRC University Campus, Sitapura, Jaipur</p>
          <p className="text-sm text-muted-color">📞 Support Helpline: +91 98765 43210</p>
          <p className="text-sm text-muted-color">✉️ Email Support: help@staynear.in</p>
        </div>
      </div>
      <div className="footer-bottom text-center text-xs text-muted-color">
        <p>&copy; {new Date().getFullYear()} StayNear. All rights reserved.</p>
        <p className="accessibility-notice">StayNear complies with WCAG accessibility principles for standard color contrasts and keyboard layouts.</p>
      </div>
    </footer>
  );
};

export default Footer;
