import React from 'react';

interface BadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isEarned: boolean;
}

const Badge: React.FC<BadgeProps> = ({ icon, title, description, isEarned }) => {
  const earnedClasses = "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-600 dark:text-green-300";
  const unearnedClasses = "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 grayscale text-gray-400 dark:text-gray-500";

  return (
    <div className={`relative group p-4 border rounded-lg flex flex-col items-center text-center transition-all duration-300 ${isEarned ? earnedClasses : unearnedClasses}`}>
      <div className={`w-16 h-16 mb-2`}>
        {icon}
      </div>
      <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200">{title}</h5>
      {/* Tooltip for description */}
      <div className="absolute bottom-full mb-2 w-48 px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {description}
        <svg className="absolute text-gray-700 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};

export default Badge;
