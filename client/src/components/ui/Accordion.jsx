import React from 'react';

const Accordion = ({ title, children }) => {
  return <div className='accordion card'><summary>{title}</summary><div>{children}</div></div>;
};

export default Accordion;
