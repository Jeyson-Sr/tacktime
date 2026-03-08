import React from 'react';
import  ProductionControl  from './ProductionControl';

// Default export wrapper
const DefaultWrapper: React.FC = () => {
  return (
    <div className="w-full">
      <div>
        <ProductionControl />
      </div>
    </div>
  );
};

export default DefaultWrapper;
