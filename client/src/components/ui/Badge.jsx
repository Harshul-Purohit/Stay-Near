import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ children, variant = 'verified', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>{children}</span>
  );
};

Badge.propTypes = { children: PropTypes.node.isRequired, variant: PropTypes.string, className: PropTypes.string };

export default Badge;
