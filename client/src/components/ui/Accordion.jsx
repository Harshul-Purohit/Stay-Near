import React, { useState } from 'react';

const Accordion = ({ title, children, icon, subtitle, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className='accordion card' style={{ padding: 0, marginBottom: '15px' }}>
      <button 
        className="menu-accordion-btn flex items-center justify-between w-full text-left"
        style={{ padding: '15px 20px', cursor: 'pointer', border: 'none', background: 'none' }}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="flex items-center gap-md">
          {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
          <div>
            <h3 className="font-bold text-base">{title}</h3>
            {subtitle && <p className="text-xs text-muted-color mt-1">{subtitle}</p>}
          </div>
        </div>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--primary-color)', fontSize: '12px' }}>▼</span>
      </button>
      {isOpen && (
        <div className="menu-accordion-body" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
