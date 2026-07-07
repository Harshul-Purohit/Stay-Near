import React from 'react';

const CompareCard = ({ hostel }) => {
  return <div className='compare-card card'>Compare: {hostel?.name}</div>;
};

export default CompareCard;
