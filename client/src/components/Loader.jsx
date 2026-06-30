import React from 'react';

const Loader = ({ fullPage = false }) => {
  return (
    <div className={`loader-container ${fullPage ? 'loader-fullpage' : ''}`}>
      <div className="spinner" aria-label="Loading content"></div>
    </div>
  );
};

export default Loader;
