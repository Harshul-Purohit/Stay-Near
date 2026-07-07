import React from 'react';

const StatisticsCard = ({ label, value }) => {
  return <div className='stats-card card'><span className='text-label-md'>{label}</span><h2 className='text-display'>{value}</h2></div>;
};

export default StatisticsCard;
