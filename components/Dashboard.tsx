import React, { useState, useEffect } from 'react';
import type { UserProfile, DailyHabits, Recommendations as RecommendationsType, LifeImpact } from '../types';
import Recommendations from './Recommendations';
import FoodAnalyzer from './FoodAnalyzer';
import LifeImpactDashboard from './LifeImpactDashboard';
import HealthLog from './HealthLog';
import HealthReport from './HealthReport';
import { getDailyHealthTip, getRecommendations, predictLifeImpact } from '../services/geminiService';
import Card from './Card';
import Spinner from './Spinner';

// @ts-ignore
const { jsPDF } = window.jspdf;
declare const html2canvas: any;

interface DashboardProps {
  userProfile: UserProfile;
}

type Tab = 'recommendations' | 'food' | 'impact' | 'log';

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(true);
  
  const [habits, setHabits] = useState<DailyHabits>({
    exerciseFrequency: '1-2 times a week',
    sleepHours: 7,
    dietQuality: 'average',
    mood: 'neutral',
  });
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<{ recommendations: RecommendationsType; impact: LifeImpact } | null>(null);

  useEffect(() => {
    const fetchTip = async () => {
        try {
            const result = await getDailyHealthTip(userProfile);
            setDailyTip(result.tip);
        } catch (error) {
            console.error("Failed to fetch daily tip:", error);
            setDailyTip("Remember to stay hydrated by drinking plenty of water throughout the day!");
        } finally {
            setLoadingTip(false);
        }
    };
    fetchTip();
  }, [userProfile]);
  
  useEffect(() => {
    if (reportData) {
      const generatePdf = async () => {
        const reportElement = document.getElementById('health-report-content');
        if (reportElement) {
          const canvas = await html2canvas(reportElement, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Health_Report_${new Date().toLocaleDateString()}.pdf`);
        }
        setReportData(null); // Clean up after generation
        setIsGeneratingReport(false);
      };
      // Timeout to ensure the DOM is painted before capturing
      setTimeout(generatePdf, 100);
    }
  }, [reportData]);
  
  const handleDownloadReport = async () => {
    setIsGeneratingReport(true);
    try {
      const [recommendations, impact] = await Promise.all([
        getRecommendations(userProfile),
        predictLifeImpact(userProfile, habits)
      ]);
      setReportData({ recommendations, impact });
    } catch (error) {
      console.error("Failed to generate report data:", error);
      alert("There was an error generating your report. Please try again.");
      setIsGeneratingReport(false);
    }
  };


  const calculateBmi = () => {
    if (userProfile.height > 0) {
        const heightInMeters = userProfile.height / 100;
        return (userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  const getBmiInfo = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
    if (bmiValue < 25) return { category: 'Normal weight', color: 'text-green-500' };
    if (bmiValue < 30) return { category: 'Overweight', color: 'text-yellow-500' };
    return { category: 'Obesity', color: 'text-red-500' };
  }

  const bmi = calculateBmi();
  const bmiInfo = bmi !== 'N/A' ? getBmiInfo(parseFloat(bmi)) : { category: 'N/A', color: 'text-gray-500' };


  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return <Recommendations userProfile={userProfile} />;
      case 'food':
        return <FoodAnalyzer userProfile={userProfile} />;
      case 'impact':
        return <LifeImpactDashboard userProfile={userProfile} habits={habits} onHabitsChange={setHabits} />;
      case 'log':
        return <HealthLog userProfile={userProfile} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, id }: { tab: Tab, label: string, id: string }) => (
    <button
      id={id}
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
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
       {reportData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }}>
            <HealthReport 
                userProfile={userProfile} 
                habits={habits} 
                recommendations={reportData.recommendations} 
                impact={reportData.impact} 
            />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-4 text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your BMI</h3>
            <p className={`text-4xl font-bold ${bmiInfo.color}`}>{bmi}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{bmiInfo.category}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex flex-col justify-center items-center h-full">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">💡 Tip of the Day</h3>
             {loadingTip ? <p className="text-center text-sm mt-2 text-gray-500">Fetching your daily tip...</p> : <p className="text-center text-sm mt-2 text-gray-700 dark:text-gray-200">{dailyTip}</p>}
          </div>
        </Card>
         <Card>
          <div className="p-4 flex flex-col justify-center items-center h-full space-y-2">
             <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Actions</h3>
             <button
                onClick={handleDownloadReport}
                disabled={isGeneratingReport}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait flex items-center justify-center transition-colors"
             >
                {isGeneratingReport ? <><Spinner /> Generating...</> : 'Download Report'}
             </button>
          </div>
        </Card>
      </div>

      <div id="dashboard-tabs" className="flex justify-center bg-white dark:bg-gray-900/50 rounded-lg p-2 shadow-sm">
        <nav className="flex space-x-1 sm:space-x-2">
          <TabButton tab="recommendations" label="Daily Plan" id="tab-recommendations" />
          <TabButton tab="food" label="Food Analyzer" id="tab-food" />
          <TabButton tab="impact" label="Life Impact" id="tab-impact" />
          <TabButton tab="log" label="Health Log" id="tab-log" />
        </nav>
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard;