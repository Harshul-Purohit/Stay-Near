import React, { memo } from 'react';

const ReviewCard = ({ review }) => {
  return <div className='review-card card'>{review?.text}</div>;
};

export default memo(ReviewCard);
