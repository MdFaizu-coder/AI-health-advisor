import React, { useState } from 'react';
import type { UserProfile } from '../types';
import Card from './Card';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 30,
    gender: 'male',
    weight: 70,
    height: 175,
    conditions: 'None',
    cuisinePreferences: '',
    dietaryRestrictions: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.age && profile.gender && profile.weight && profile.height && profile.conditions) {
      onSubmit(profile as UserProfile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card id="profile-form-card">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Create Your Health Profile</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Enter your details to get personalized AI-powered health insights.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                <input type="number" name="age" id="age" value={profile.age || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                <select name="gender" id="gender" value={profile.gender || 'male'} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
                <input type="number" name="weight" id="weight" value={profile.weight || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
                <input type="number" name="height" id="height" value={profile.height || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medical Conditions (e.g., Diabetes, High BP, None)</label>
              <textarea name="conditions" id="conditions" value={profile.conditions || ''} onChange={handleChange} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="cuisinePreferences" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Cuisines</label>
                    <input type="text" name="cuisinePreferences" id="cuisinePreferences" value={profile.cuisinePreferences || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Italian, Mexican" />
                </div>
                <div>
                    <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dietary Restrictions & Allergies</label>
                    <input type="text" name="dietaryRestrictions" id="dietaryRestrictions" value={profile.dietaryRestrictions || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Vegan, Gluten-Free" />
                </div>
            </div>
            <div>
              <button id="submit-profile-btn" type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                Generate My Dashboard
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ProfileForm;