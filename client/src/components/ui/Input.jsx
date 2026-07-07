import React from 'react';
import PropTypes from 'prop-types';

const Input = ({ type = 'text', value, onChange, placeholder = '', className = '', ...props }) => {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={orm-control } style={{borderColor: 'var(--md-sys-color-outline-variant)'}} {...props} />
  );
};

Input.propTypes = { type: PropTypes.string, value: PropTypes.any, onChange: PropTypes.func, placeholder: PropTypes.string, className: PropTypes.string };

export default Input;
