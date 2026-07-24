import React from 'react';

const Tabs = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className='tabs-header flex gap-md flex-wrap' style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '25px', paddingBottom: '10px' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-btn font-semibold text-sm transition-colors ${activeTab === tab.id ? 'tab-active' : 'text-muted-color hover:text-primary'}`}
          style={{ padding: '8px 16px', borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : 'none', color: activeTab === tab.id ? 'var(--primary-color)' : '' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
