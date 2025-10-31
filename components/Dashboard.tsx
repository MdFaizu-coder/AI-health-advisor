import React, { useState } from 'react';
import type { UserProfile } from '../types';
import Recommendations from './Recommendations';
import FoodAnalyzer from './FoodAnalyzer';
import LifeImpactDashboard from './LifeImpactDashboard';

interface DashboardProps {
  userProfile: UserProfile;
}

type Tab = 'recommendations' | 'food' | 'impact';

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return <Recommendations userProfile={userProfile} />;
      case 'food':
        return <FoodAnalyzer userProfile={userProfile} />;
      case 'impact':
        return <LifeImpactDashboard userProfile={userProfile} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, id }: { tab: Tab, label: string, id: string }) => (
    <button
      id={id}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div id="dashboard-tabs" className="flex justify-center bg-white dark:bg-gray-900/50 rounded-lg p-2 shadow-sm">
        <nav className="flex space-x-2">
          <TabButton tab="recommendations" label="Daily Recommendations" id="tab-recommendations" />
          <TabButton tab="food" label="Food Analyzer" id="tab-food" />
          <TabButton tab="impact" label="Life Impact Score" id="tab-impact" />
        </nav>
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard;
