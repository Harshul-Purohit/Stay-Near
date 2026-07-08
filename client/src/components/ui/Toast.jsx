import React from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`toast toast-${type}`}>
      <span className='toast-message'>{message}</span>
      <button onClick={onClose} className='toast-close'>&times;</button>
    </div>
  );
};

Toast.propTypes = { message: PropTypes.string.isRequired, type: PropTypes.string, onClose: PropTypes.func };

export default Toast;
