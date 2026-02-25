import React from 'react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
  </div>
);

export default LoadingSpinner;