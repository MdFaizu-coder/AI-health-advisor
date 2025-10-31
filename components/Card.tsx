import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // Fix: Add id prop to allow it to be passed to the Card component, fixing a type error in ProfileForm.
  id?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`bg-white dark:bg-gray-900/50 rounded-xl shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;
