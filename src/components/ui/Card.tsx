import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
}) => {
  const baseStyles = 'bg-white rounded-xl border border-gray-200 shadow-sm';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hoverable
    ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer'
    : '';

  const combinedClassName = `${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`;

  return <div className={combinedClassName}>{children}</div>;
};

export default Card;