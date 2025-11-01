import React from 'react';
import type { UserProfile, DailyHabits, Recommendations, LifeImpact } from '../types';

interface HealthReportProps {
    userProfile: UserProfile;
    habits: DailyHabits;
    recommendations: Recommendations;
    impact: LifeImpact;
}

const HealthReport: React.FC<HealthReportProps> = ({ userProfile, habits, recommendations, impact }) => {
    
    const getScoreColor = (score: number) => {
        if (score > 75) return 'text-green-600';
        if (score > 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div id="health-report-content" className="p-8 bg-white text-gray-800 font-sans">
            <header className="flex items-center justify-between pb-4 border-b-2 border-indigo-500">
                <div>
                    <h1 className="text-4xl font-bold text-indigo-600">AI Health Report</h1>
                    <p className="text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                </div>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            </header>

            <section className="mt-8">
                <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4">User Health Profile</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <p><strong>Age:</strong> {userProfile.age}</p>
                    <p><strong>Gender:</strong> {userProfile.gender}</p>
                    <p><strong>Weight:</strong> {userProfile.weight} kg</p>
                    <p><strong>Height:</strong> {userProfile.height} cm</p>
                    <p className="col-span-2"><strong>Health Goal:</strong> {userProfile.healthGoal.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="col-span-2"><strong>Medical Conditions:</strong> {userProfile.conditions}</p>
                </div>
            </section>
            
            <section className="mt-8">
                <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4">Life Impact Score & Analysis</h2>
                <div className="flex items-center gap-8 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <p className="font-bold text-lg">Your Score</p>
                        <p className={`text-6xl font-bold ${getScoreColor(impact.score)}`}>{impact.score}</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm">{impact.summary}</p>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-6 mt-4 text-sm">
                    <div>
                        <h3 className="font-bold text-red-600">Key Risk Factors</h3>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            {impact.riskFactors.map((rf, i) => <li key={i}><strong>{rf.factor}:</strong> {rf.advice}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-green-600">Key Positive Factors</h3>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            {impact.positiveFactors.map((pf, i) => <li key={i}><strong>{pf.factor}:</strong> {pf.advice}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4">Personalized Recommendations</h2>
                <div className="space-y-6 text-sm">
                    {/* Diet Plan */}
                    <div>
                        <h3 className="text-xl font-bold text-indigo-600 mb-2">Diet Plan: {recommendations.diet.planName}</h3>
                        <p className="italic mb-2">{recommendations.diet.description}</p>
                        <div className="grid grid-cols-2 gap-x-8 p-3 bg-indigo-50 rounded">
                            <p><strong>Calories:</strong> {recommendations.diet.dailyCalories} kcal</p>
                            <p><strong>Protein:</strong> {recommendations.diet.macronutrients.protein}</p>
                            <p><strong>Carbs:</strong> {recommendations.diet.macronutrients.carbohydrates}</p>
                            <p><strong>Fats:</strong> {recommendations.diet.macronutrients.fats}</p>
                        </div>
                        <div className="mt-2">
                            <h4 className="font-semibold">Sample Meals:</h4>
                             <ul className="list-disc list-inside">
                                <li><strong>Breakfast:</strong> {recommendations.diet.sampleMeals.breakfast}</li>
                                <li><strong>Lunch:</strong> {recommendations.diet.sampleMeals.lunch}</li>
                                <li><strong>Dinner:</strong> {recommendations.diet.sampleMeals.dinner}</li>
                            </ul>
                        </div>
                    </div>
                    {/* Workout Routine */}
                    <div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">Workout Routine</h3>
                        {recommendations.workouts.map((workout, index) => (
                             <div key={index} className="p-3 bg-green-50 rounded mb-2">
                                <h4 className="font-bold">{workout.type} ({workout.frequency})</h4>
                                <p className="text-xs"><strong>Duration:</strong> {workout.duration}</p>
                                <p className="mt-1">{workout.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <footer className="text-center text-xs text-gray-400 mt-12 pt-4 border-t">
                <p>This report is generated by an AI assistant and is for informational purposes only.</p>
                <p>It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.</p>
            </footer>
        </div>
    );
};

export default HealthReport;
