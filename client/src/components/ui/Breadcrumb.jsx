import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ paths = [] }) => {
  return (
    <nav className='breadcrumb flex gap-xs text-label-md items-center text-muted-color mb-4'>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="font-medium text-primary">{path.label}</span>
            ) : (
              <Link to={path.url} className="nav-link hover:text-primary transition-colors">{path.label}</Link>
            )}
            {!isLast && <span>&gt;</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
