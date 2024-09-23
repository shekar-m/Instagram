import React from 'react';
import { Shimmer } from 'react-shimmer';
import './Post.css';
const ShimmerPlaceholder = () => (
    <div className="shimmer-wrapper">
      <Shimmer width={400} height={800} className="shimmer-image" />
      <div className="shimmer-content">
        <Shimmer width={400} height={800} className="shimmer-text" />
        <Shimmer width={400} height={800} className="shimmer-text" />
      </div>
    </div>
  );

export default ShimmerPlaceholder;