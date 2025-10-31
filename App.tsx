import React, { useState } from 'react';
import type { UserProfile } from './types';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import OnboardingGuide from './components/OnboardingGuide';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!localStorage.getItem('onboardingComplete'));


  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleReset = () => {
    setUserProfile(null);
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('healthPredictionHistory');
    setShowOnboarding(true);
  };

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingComplete', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {showOnboarding && (
        <OnboardingGuide
          isDashboardVisible={!!userProfile}
          onFinish={handleOnboardingFinish}
        />
      )}
      <Header onReset={handleReset} profileExists={!!userProfile} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!userProfile ? (
          <ProfileForm onSubmit={handleProfileSubmit} />
        ) : (
          <Dashboard userProfile={userProfile} />
        )}
      </main>
    </div>
  );
};

export default App;