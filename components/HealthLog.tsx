import React, { useState, useEffect, useMemo } from 'react';
import type { UserProfile, HealthLogEntry } from '../types';
import Card from './Card';

// @ts-ignore
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts || {};

interface HealthLogProps {
  userProfile: UserProfile;
}

const HealthLog: React.FC<HealthLogProps> = ({ userProfile }) => {
  const [logs, setLogs] = useState<HealthLogEntry[]>([]);
  const [newLog, setNewLog] = useState({ condition: '', notes: '', severity: 3 as HealthLogEntry['severity'] });
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  
  const userConditions = useMemo(() => {
    return userProfile.conditions.split(',').map(c => c.trim()).filter(c => c && c.toLowerCase() !== 'none');
  }, [userProfile.conditions]);

  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('healthConditionLog');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
      // Pre-select the first condition if available
      if (userConditions.length > 0) {
        setNewLog(prev => ({ ...prev, condition: userConditions[0] }));
        setSelectedCondition(userConditions[0]);
      } else {
        setSelectedCondition('All');
      }
    } catch (e) {
      console.error("Failed to parse health logs from localStorage", e);
      localStorage.removeItem('healthConditionLog');
    }
  }, [userConditions]);

  useEffect(() => {
    localStorage.setItem('healthConditionLog', JSON.stringify(logs));
  }, [logs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLog(prev => ({ ...prev, [name]: name === 'severity' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.condition.trim() === '' || newLog.notes.trim() === '') {
      alert('Please fill in both condition and notes.');
      return;
    }
    const entry: HealthLogEntry = {
      ...newLog,
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      severity: newLog.severity as HealthLogEntry['severity'],
    };
    setLogs(prev => [entry, ...prev]);
    // Reset form, keeping the selected condition
    setNewLog({ condition: newLog.condition, notes: '', severity: 3 as HealthLogEntry['severity'] });
  };

  const filteredLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (selectedCondition === 'All') {
      return sorted;
    }
    return sorted.filter(log => log.condition === selectedCondition);
  }, [logs, selectedCondition]);

  const chartData = filteredLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Severity: log.severity,
  }));

  const allTrackedConditions = useMemo(() => ['All', ...new Set(logs.map(log => log.condition))], [logs]);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center mb-6">Your Health Log</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold mb-4">Add New Entry</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                {userConditions.length > 0 ? (
                    <select
                        name="condition"
                        id="condition"
                        value={newLog.condition}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {userConditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                ) : (
                    <input
                        type="text"
                        name="condition"
                        id="condition"
                        value={newLog.condition}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g., Headache"
                    />
                )}
              </div>
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symptom Severity (1=Mild, 5=Severe)</label>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">1</span>
                  <input type="range" name="severity" id="severity" min="1" max="5" value={newLog.severity} onChange={handleInputChange} className="w-full mx-2" />
                  <span className="text-xs text-gray-500">5</span>
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  name="notes"
                  id="notes"
                  value={newLog.notes}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Felt better after resting."
                />
              </div>
              <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Add Log Entry</button>
            </form>
          </div>
          {/* History & Chart Section */}
          <div className="lg:col-span-2">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold">Condition Progress</h3>
                 <select onChange={(e) => setSelectedCondition(e.target.value)} value={selectedCondition} className="block pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
                    {allTrackedConditions.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </div>
              {LineChart && logs.length > 0 ? (
                <div className="h-64 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg mb-6">
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4B5563' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Severity" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
             ) : <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6"><p className="text-gray-500">Log entries to see your progress chart.</p></div>}
             
            <h3 className="text-xl font-semibold mb-4">Log History</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {logs.length > 0 ? logs.map(log => (
                    <div key={log.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{log.condition}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleString()}</p>
                            </div>
                            <span className="text-sm font-bold text-indigo-500">Severity: {log.severity}/5</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{log.notes}</p>
                    </div>
                )) : <p className="text-gray-500">No entries yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HealthLog;
