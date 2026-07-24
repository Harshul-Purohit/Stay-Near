const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (index) => {
    if (type === 'card') {
      return (
        <div className="skeleton-card" key={`card-${index}`}>
          <div className="skeleton-image shimmer"></div>
          <div className="skeleton-info">
            <div className="skeleton-title shimmer"></div>
            <div className="skeleton-badge-row">
              <div className="skeleton-badge shimmer"></div>
              <div className="skeleton-badge shimmer"></div>
            </div>
            <div className="skeleton-price shimmer"></div>
            <div className="skeleton-button shimmer"></div>
          </div>
        </div>
      );
    }

    if (type === 'details') {
      return (
        <div className="skeleton-details" key={`details-${index}`}>
          <div className="skeleton-title shimmer" style={{ width: '40%', height: '36px' }}></div>
          <div className="skeleton-gallery grid gap-md" style={{ gridTemplateColumns: '2fr 1fr', height: '350px', margin: '20px 0' }}>
            <div className="shimmer" style={{ borderRadius: '8px' }}></div>
            <div className="grid gap-sm" style={{ gridTemplateRows: '1fr 1fr' }}>
              <div className="shimmer" style={{ borderRadius: '8px' }}></div>
              <div className="shimmer" style={{ borderRadius: '8px' }}></div>
            </div>
          </div>
          <div className="skeleton-title shimmer" style={{ width: '80%', height: '20px', margin: '10px 0' }}></div>
          <div className="skeleton-title shimmer" style={{ width: '60%', height: '20px', margin: '10px 0' }}></div>
        </div>
      );
    }

    return (
      <div className="skeleton-line shimmer" key={`line-${index}`} style={{ height: '16px', margin: '8px 0', borderRadius: '4px' }}></div>
    );
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </>
  );
};

export default SkeletonLoader;

