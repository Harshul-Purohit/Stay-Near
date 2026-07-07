import React from 'react';

const ReviewCard = ({ review }) => {
  return <div className='review-card card'>{review?.text}</div>;
};

export default ReviewCard;
