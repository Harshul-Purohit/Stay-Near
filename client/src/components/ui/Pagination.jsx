import React from 'react';

const Pagination = ({ total, current, onChange }) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  if (total <= 1) return null;

  return (
    <div className='pagination flex gap-xs items-center justify-center' style={{ marginTop: '24px' }}>
      <button 
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className='btn btn-secondary btn-sm flex items-center justify-center'
        style={{ padding: '4px 12px', opacity: current === 1 ? 0.5 : 1 }}
      >
        Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`flex items-center justify-center transition-colors font-medium text-sm`}
          style={{ 
            width: '32px', height: '32px', borderRadius: '4px',
            backgroundColor: current === page ? 'var(--primary-color)' : 'var(--surface-color)',
            color: current === page ? 'var(--md-sys-color-on-primary)' : 'inherit',
            border: current !== page ? '1px solid var(--border-color)' : 'none'
          }}
        >
          {page}
        </button>
      ))}
      <button 
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className='btn btn-secondary btn-sm flex items-center justify-center'
        style={{ padding: '4px 12px', opacity: current === total ? 0.5 : 1 }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
