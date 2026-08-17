import React, { memo } from 'react';

const CompareCard = ({ hostel }) => {
  return <div className='compare-card card'>Compare: {hostel?.name}</div>;
};

export default memo(CompareCard);
