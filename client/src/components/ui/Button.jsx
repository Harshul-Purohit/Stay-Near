import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, onClick, className = '', variant = 'primary', ...props }) => {
  return (
    <button onClick={onClick} className={tn btn- } {...props}>
      {children}
    </button>
  );
};

Button.propTypes = { children: PropTypes.node.isRequired, onClick: PropTypes.func, className: PropTypes.string, variant: PropTypes.string };

export default Button;
