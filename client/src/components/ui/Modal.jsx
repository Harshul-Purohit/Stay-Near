import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '500px' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;
  
  return (
    <div 
      className='loader-fullpage flex justify-center items-center' 
      style={{ zIndex: 1010, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className='modal-content card relative flex flex-col' 
        style={{ maxWidth: maxWidth, width: '90%', margin: '20px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-muted-color hover:text-error-color font-bold text-2xl leading-none" style={{ cursor: 'pointer' }}>&times;</button>
        </div>
        <div style={{ overflowY: 'auto', paddingRight: '5px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
