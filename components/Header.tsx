
import React from 'react';

interface HeaderProps {
  onReset: () => void;
  profileExists: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, profileExists }) => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">
              AI Health Assistant
            </h1>
          </div>
          {profileExists && (
            <button
              onClick={onReset}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Reset Profile
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
