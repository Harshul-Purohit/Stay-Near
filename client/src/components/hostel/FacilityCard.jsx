import React, { memo } from 'react';

const FacilityCard = ({ facility }) => {
  return <div className='facility-card'>{facility}</div>;
};

export default memo(FacilityCard);
