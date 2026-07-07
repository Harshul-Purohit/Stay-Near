import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ children, variant = 'verified', className = '' }) => {
  return (
    <span className={adge badge- }>{children}</span>
  );
};

Badge.propTypes = { children: PropTypes.node.isRequired, variant: PropTypes.string, className: PropTypes.string };

export default Badge;
