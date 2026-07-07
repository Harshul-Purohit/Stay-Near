import React from 'react';

const Gallery = ({ images = [] }) => {
  return <div className='gallery flex'>{images.map((img, i) => <img key={i} src={img} alt='Gallery' />)}</div>;
};

export default Gallery;
