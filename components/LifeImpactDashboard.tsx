import React, { useState, useEffect } from 'react';
import type { UserProfile, DailyHabits, LifeImpact } from '../types';
import { predictLifeImpact, getMentalHealthTip } from '../services/geminiService';
import Card from './Card';
import Spinner from './Spinner';
import Badge from './Badge'; // Import the new Badge component

interface LifeImpactDashboardProps {
  userProfile: UserProfile;
}

// SVG Icons for Badges
const SleepIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);
const FitnessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5l-2.25-2.25A4.5 4.5 0 017.5 12.75l-2.25-2.25a4.5 4.5 0 016.364-6.364l2.25 2.25a4.5 4.5 0 010 6.364l-2.25 2.25a4.5 4.5 0 01-6.364 0z" />
    </svg>
);
const DietIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 1 0 0-13.5h9a9.75 9.75 0 1 0 0 13.5zM16.5 18.75v-1.5m-9-10.5v-1.5m0 13.5v-1.5m0-10.5h9m-9 3.75h9m-9 3.75h9m-9 3.75h9" />
    </svg>
);


const LifeImpactDashboard: React.FC<LifeImpactDashboardProps> = ({ userProfile }) => {
  // @ts-ignore
  const { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = window.Recharts || {};

  const [habits, setHabits] = useState<DailyHabits>({
    exerciseFrequency: '1-2 times a week',
    sleepHours: 7,
    dietQuality: 'average',
    mood: 'neutral',
  });
  const [impact, setImpact] = useState<LifeImpact | null>(null);
  const [mentalHealthTip, setMentalHealthTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState<Array<{ impact: LifeImpact; habits: DailyHabits; date: string }>>([]);
  const [earnedBadges, setEarnedBadges] = useState({ sleep: false, fitness: false, diet: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load prediction history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('healthPredictionHistory');
      if (storedHistory) {
        setPredictionHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse prediction history from localStorage", e);
      localStorage.removeItem('healthPredictionHistory');
    }
  }, []);

  // Save prediction history to localStorage whenever it changes
  useEffect(() => {
    if (predictionHistory.length > 0) {
      localStorage.setItem('healthPredictionHistory', JSON.stringify(predictionHistory));
    }
  }, [predictionHistory]);
  
  // Check for badge achievements when prediction history changes
  useEffect(() => {
    const STREAK_REQUIRED = 3;
    if (predictionHistory.length < STREAK_REQUIRED) return;

    const lastThree = predictionHistory.slice(-STREAK_REQUIRED);

    // Once earned, a badge is kept.
    const checkSleep = lastThree.every(entry => entry.habits.sleepHours >= 7);
    const checkFitness = lastThree.every(entry => ['daily', '3-4 times a week'].includes(entry.habits.exerciseFrequency));
    const checkDiet = lastThree.every(entry => entry.habits.dietQuality === 'healthy');

    setEarnedBadges(prev => ({
        sleep: prev.sleep || checkSleep,
        fitness: prev.fitness || checkFitness,
        diet: prev.diet || checkDiet,
    }));
  }, [predictionHistory]);


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setHabits(prev => ({ ...prev, [name]: name === 'sleepHours' ? Number(value) : value }));
  };
  
  const handleMoodChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMood = e.target.value as DailyHabits['mood'];
    setHabits(prev => ({ ...prev, mood: newMood }));
    setMentalHealthTip(null);
    setLoadingTip(true);
    try {
        const result = await getMentalHealthTip(newMood);
        setMentalHealthTip(result.tip);
    } catch (err) {
        console.error("Failed to get mental health tip", err);
        setMentalHealthTip("Take a few deep breaths, focusing on the sensation of air entering and leaving your body.");
    } finally {
        setLoadingTip(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictLifeImpact(userProfile, habits);
      const newEntry = {
        impact: result,
        habits,
        date: new Date().toISOString(),
      };
      setImpact(result);
      setPredictionHistory(prev => [...prev, newEntry]);
    } catch (err) {
      setError('Failed to predict life impact. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 75) return 'text-green-500';
    if (score > 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getImpactColor = (impact: 'High' | 'Medium' | 'Low') => {
    if (impact === 'High') return 'bg-red-500';
    if (impact === 'Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  }

  const trendsChartData = predictionHistory.map((entry) => ({
      name: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Impact Score': entry.impact.score,
      'Sleep Hours': entry.habits.sleepHours,
  }));

  const allBadgesEarned = earnedBadges.sleep && earnedBadges.fitness && earnedBadges.diet;


  return (
    <Card>
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">Life Impact Prediction</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exercise Frequency</label>
              <select name="exerciseFrequency" value={habits.exerciseFrequency} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option>daily</option>
                <option>3-4 times a week</option>
                <option>1-2 times a week</option>
                <option>rarely</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Average Sleep (hours)</label>
              <input type="number" name="sleepHours" value={habits.sleepHours} onChange={handleChange} className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diet Quality</label>
              <select name="dietQuality" value={habits.dietQuality} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option>healthy</option>
                <option>average</option>
                <option>unhealthy</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">How are you feeling?</label>
              <select name="mood" value={habits.mood} onChange={handleMoodChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="happy">Happy</option>
                <option value="neutral">Neutral</option>
                <option value="sad">Sad</option>
                <option value="anxious">Anxious</option>
                <option value="stressed">Stressed</option>
              </select>
            </div>
        </div>
         {(loadingTip || mentalHealthTip) && (
            <div className="mb-6">
                <Card className="bg-indigo-50 dark:bg-indigo-900/40">
                    <div className="p-4 text-center">
                        {loadingTip && <p className="text-sm text-indigo-700 dark:text-indigo-200">Finding a tip for you...</p>}
                        {mentalHealthTip && <p className="text-sm text-indigo-800 dark:text-indigo-200">{mentalHealthTip}</p>}
                    </div>
                </Card>
            </div>
        )}
        <div className="text-center mb-8">
            <button onClick={handlePredict} disabled={loading} className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
            {loading ? <Spinner /> : 'Predict My Health Score'}
            </button>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {impact && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2 flex flex-col items-center justify-center">
                <h3 className="text-xl font-semibold mb-4">Your Score</h3>
                <div className="w-48 h-48 rounded-full flex items-center justify-center border-8 border-gray-200 dark:border-gray-700">
                  <span className={`text-7xl font-bold ${getScoreColor(impact.score)}`}>{impact.score}</span>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-gray-300">{impact.summary}</p>
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-red-500 mb-2">Risk Factors</h4>
                    <ul className="space-y-2">
                      {impact.riskFactors.map((rf, i) => (
                        <li key={i} className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            <div className="flex items-center justify-between font-semibold">
                                <span>{rf.factor}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full text-white ${getImpactColor(rf.impact)}`}>{rf.impact}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{rf.advice}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h4 className="font-bold text-green-500 mb-2">Positive Factors</h4>
                    <ul className="space-y-2">
                      {impact.positiveFactors.map((pf, i) => (
                        <li key={i} className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            <div className="flex items-center justify-between font-semibold">
                                <span>{pf.factor}</span>
                                 <span className={`px-2 py-0.5 text-xs rounded-full text-white ${getImpactColor(pf.impact)}`}>{pf.impact}</span>
                            </div>
                             <p className="text-gray-600 dark:text-gray-400 mt-1">{pf.advice}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-center mb-6">Your Achievements</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <Badge icon={<SleepIcon />} title="Sleep Star" description="Sleep 7+ hours for 3 days in a row." isEarned={earnedBadges.sleep} />
                    <Badge icon={<FitnessIcon />} title="Fitness Fanatic" description="Exercise frequently for 3 days in a row." isEarned={earnedBadges.fitness} />
                    <Badge icon={<DietIcon />} title="Healthy Eater" description="Maintain a healthy diet for 3 days in a row." isEarned={earnedBadges.diet} />
                    <Badge icon={<TrophyIcon />} title="Wellness Warrior" description="Earn all other health badges." isEarned={allBadgesEarned} />
                </div>
            </div>
            
            {predictionHistory.length > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-center mb-6">Your Health Trends</h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">Score & Sleep History</h4>
                  {LineChart ? (
                      <div style={{ width: '100%', height: 300 }}>
                          <ResponsiveContainer>
                              <LineChart data={trendsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                                        borderColor: '#4B5563',
                                        borderRadius: '0.5rem',
                                        color: '#F9FAFB' 
                                    }} 
                                    itemStyle={{ color: '#E5E7EB' }}
                                    labelStyle={{ color: '#D1D5DB', fontWeight: 'bold' }}
                                  />
                                  <Legend />
                                  <Line type="monotone" dataKey="Impact Score" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                  <Line type="monotone" dataKey="Sleep Hours" stroke="#82ca9d" strokeWidth={2} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  ) : <p className="text-center">Charts are loading...</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default LifeImpactDashboard;