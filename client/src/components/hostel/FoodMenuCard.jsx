import React, { memo } from 'react';

const FoodMenuCard = ({ menu }) => {
  return <div className='food-menu-card'>{menu}</div>;
};

export default memo(FoodMenuCard);
