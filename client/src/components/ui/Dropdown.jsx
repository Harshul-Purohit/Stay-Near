import React from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({ options = [], value, onChange, className = '' }) => {
  return (
    <select value={value} onChange={onChange} className={`form-control ${className}`} style={{borderColor: 'var(--md-sys-color-outline-variant)'}}>
      {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
    </select>
  );
};

Dropdown.propTypes = { options: PropTypes.array, value: PropTypes.any, onChange: PropTypes.func, className: PropTypes.string };

export default Dropdown;
