import React from 'react';

const DashboardCard = ({ title, children }) => {
  return <div className='dashboard-card card'><h3 className='text-headline-md'>{title}</h3>{children}</div>;
};

export default DashboardCard;
