
import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, Recommendations as RecommendationsType } from '../types';
import { getRecommendations } from '../services/geminiService';
import Card from './Card';
import Spinner from './Spinner';

interface RecommendationsProps {
  userProfile: UserProfile;
}

const Recommendations: React.FC<RecommendationsProps> = ({ userProfile }) => {
  const [recommendations, setRecommendations] = useState<RecommendationsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendations(userProfile);
      setRecommendations(result);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);
  
  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-8"><Spinner /></div>;
    }
    if (error) {
      return <div className="text-center text-red-500 p-8">{error}</div>;
    }
    if (recommendations) {
      const { diet, medicineInfo, workouts } = recommendations;
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diet */}
          <Card className="lg:col-span-1">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-indigo-500">Diet Plan: {diet.planName}</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">{diet.description}</p>
              <ul className="space-y-2 text-sm">
                <li><strong>Calories:</strong> {diet.dailyCalories} kcal</li>
                <li><strong>Protein:</strong> {diet.macronutrients.protein}</li>
                <li><strong>Carbs:</strong> {diet.macronutrients.carbohydrates}</li>
                <li><strong>Fats:</strong> {diet.macronutrients.fats}</li>
              </ul>
              <h4 className="font-semibold mt-4 mb-2">Sample Meals:</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                <li><strong>Breakfast:</strong> {diet.sampleMeals.breakfast}</li>
                <li><strong>Lunch:</strong> {diet.sampleMeals.lunch}</li>
                <li><strong>Dinner:</strong> {diet.sampleMeals.dinner}</li>
              </ul>
            </div>
          </Card>
          {/* Workouts */}
          <Card className="lg:col-span-1">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-green-500">Workout Routine</h3>
              {workouts.map((workout, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="font-semibold">{workout.type}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{workout.description}</p>
                  <p className="text-xs mt-1"><strong>Frequency:</strong> {workout.frequency}, <strong>Duration:</strong> {workout.duration}</p>
                </div>
              ))}
            </div>
          </Card>
          {/* Medicine Info */}
          <Card className="lg:col-span-1">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-500">Medication Info (General Advice)</h3>
              {medicineInfo.map((med, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="font-semibold">{med.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Purpose:</strong> {med.purpose}</p>
                  <p className="text-xs mt-1 bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md">{med.generalAdvice}</p>
                </div>
              ))}
              <p className="text-xs mt-4 text-gray-500 italic">*This is not medical advice. Consult a doctor for prescriptions.</p>
            </div>
          </Card>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6">Your Daily Plan</h2>
      {renderContent()}
    </div>
  );
};

export default Recommendations;