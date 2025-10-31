
import React, { useState, useRef } from 'react';
import type { UserProfile, FoodAnalysis } from '../types';
import { analyzeFoodImage } from '../services/geminiService';
import Card from './Card';
import Spinner from './Spinner';

interface FoodAnalyzerProps {
  userProfile: UserProfile;
}

const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ userProfile }) => {
  // @ts-ignore
  const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = window.Recharts || {};

  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const base64Image = image?.split(',')[1];
      if (!base64Image) throw new Error("Could not read image data.");
      
      const result = await analyzeFoodImage(base64Image, file.type, userProfile);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze image. Please try another one.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nutritionData = analysis ? [
    { name: 'Protein (g)', value: analysis.nutritionalInfo.protein },
    { name: 'Carbs (g)', value: analysis.nutritionalInfo.carbohydrates },
    { name: 'Fats (g)', value: analysis.nutritionalInfo.fats },
  ] : [];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">AI Food Analyzer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col items-center">
            <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 mb-4 overflow-hidden">
              {image ? (
                <img src={image} alt="Food" className="object-cover h-full w-full" />
              ) : (
                <p className="text-gray-500">Upload an image of your meal</p>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <div className="flex gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Choose Image
                </button>
                <button onClick={handleAnalyze} disabled={!image || loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center">
                {loading ? <Spinner /> : 'Analyze'}
                </button>
            </div>
          </div>
          <div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {analysis && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Detected Food:</h3>
                  <p>{analysis.foodItems.join(', ')}</p>
                </div>
                <div className={`p-4 rounded-lg ${analysis.suitability.isSuitable ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                  <h3 className={`font-bold ${analysis.suitability.isSuitable ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {analysis.suitability.isSuitable ? 'Suitable for you!' : 'Not Recommended'}
                  </h3>
                  <p className={`text-sm ${analysis.suitability.isSuitable ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {analysis.suitability.reason}
                  </p>
                  {!analysis.suitability.isSuitable && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300">
                      {analysis.suitability.modification && (
                          <div className="mb-2">
                              <h4 className="font-semibold text-sm">Modification Suggestion:</h4>
                              <p className="text-sm">{analysis.suitability.modification}</p>
                          </div>
                      )}
                      {analysis.suitability.alternatives && analysis.suitability.alternatives.length > 0 && (
                          <div>
                              <h4 className="font-semibold text-sm">Healthier Alternatives:</h4>
                              <ul className="list-disc list-inside text-sm">
                                  {analysis.suitability.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
                              </ul>
                          </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                    <h3 className="text-xl font-semibold">Estimated Nutrition:</h3>
                    <p><strong>Calories:</strong> {analysis.nutritionalInfo.calories} kcal</p>
                    <p><strong>Vitamins:</strong> {analysis.nutritionalInfo.vitamins.join(', ')}</p>
                    {PieChart && (
                      <div style={{ width: '100%', height: 200 }}>
                          <ResponsiveContainer>
                          <PieChart>
                              <Pie data={nutritionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                              {nutritionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                          </PieChart>
                          </ResponsiveContainer>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FoodAnalyzer;