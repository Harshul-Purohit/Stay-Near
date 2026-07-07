import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ fullPage = false, className = '' }) => {
  return (
    <div className={`loader-container ${fullPage ? 'loader-fullpage' : ''} ${className}`}>
      <div className="spinner" style={{ borderColor: 'var(--md-sys-color-surface-variant)', borderTopColor: 'var(--md-sys-color-primary-container)' }} aria-label="Loading content"></div>
    </div>
  );
};

Loader.propTypes = {
  fullPage: PropTypes.bool,
  className: PropTypes.string,
};

export default Loader;
