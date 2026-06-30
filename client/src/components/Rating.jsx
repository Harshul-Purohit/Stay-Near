import React from 'react';

const Rating = ({ rating = 0, size = 'md', interactive = false, onRatingChange }) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // round to nearest 0.5

  const handleClick = (val) => {
    if (interactive && onRatingChange) {
      onRatingChange(val);
    }
  };

  for (let i = 1; i <= 5; i++) {
    let starClass = 'star-empty';
    if (interactive) {
      starClass = i <= rating ? 'star-filled interactive' : 'star-empty interactive';
    } else {
      if (i <= roundedRating) {
        starClass = 'star-filled';
      } else if (i - 0.5 === roundedRating) {
        starClass = 'star-half';
      }
    }

    stars.push(
      <span
        key={i}
        className={`star ${starClass} star-${size}`}
        onClick={() => handleClick(i)}
        role={interactive ? 'button' : 'img'}
        aria-label={interactive ? `Rate ${i} stars` : `Rating: ${rating} out of 5 stars`}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={(e) => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            handleClick(i);
          }
        }}
      >
        ★
      </span>
    );
  }

  return <div className="rating-stars flex">{stars}</div>;
};

export default Rating;
