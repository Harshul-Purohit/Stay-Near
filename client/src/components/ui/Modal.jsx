import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return <div className='modal-backdrop'><div className='modal-content card'>{children}<button onClick={onClose}>Close</button></div></div>;
};

export default Modal;
