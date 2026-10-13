import React from 'react';

interface TricolorStripeProps {
  className?: string;
  width?: string;
  height?: string;
  centered?: boolean;
}

export const TricolorStripe: React.FC<TricolorStripeProps> = ({
  className = '',
  width = 'w-[120px]',
  height = 'h-[3.5px]',
  centered = false,
}) => {
  return (
    <div
      className={`${width} ${height} rounded-full bg-gradient-to-r from-[#58E707] via-[#026FF6] to-[#FC6602] ${
        centered ? 'mx-auto' : ''
      } ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
};
