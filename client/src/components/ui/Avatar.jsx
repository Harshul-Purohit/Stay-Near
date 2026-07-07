import React from 'react';

const Avatar = ({ src, alt = 'Avatar' }) => {
  return <img src={src} alt={alt} className='avatar' style={{borderRadius: 'var(--radius-full)'}} />;
};

export default Avatar;
