import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, Heart, TrendingUp, type LucideIcon } from 'lucide-react';

// --- INTERFACES ---
interface DailySummary {
  summaryDate: string;
  totalSteps: number;
  totalSleepHours: number;
  avgHeartRate: number;
  calculationTime: string;
}

interface ChartDataPoint {
  name: string;
  Steps: number;
  Sleep: number;
  HR: number;
}

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit: string;
  color: string;
}

// --- CONSTANTS ---
const API_URL = 'http://localhost:5001/api/data/summary/user-abc-123';


// --- HELPER FUNCTIONS ---

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatChartData = (data: DailySummary[]): ChartDataPoint[] => {
  const sortedData = [...data].sort((a, b) => new Date(a.summaryDate).getTime() - new Date(b.summaryDate).getTime());

  return sortedData.map(item => ({
    name: formatDate(item.summaryDate),
    Steps: item.totalSteps,
    Sleep: parseFloat(item.totalSleepHours.toFixed(1)),
    HR: parseFloat(item.avgHeartRate.toFixed(1)),
  }));
};

// --- COMPONENTS ---

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, unit, color }) => (
  <div className={`flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-xl border-t-4 border-${color}-500 w-full`}>
    <div className={`text-4xl p-2 rounded-full mb-3 text-${color}-600 bg-${color}-50`}>
      <Icon size={24} />
    </div>
    <div className="text-sm font-semibold text-gray-500 uppercase">{title}</div>
    <div className={`text-3xl font-extrabold text-${color}-700 mt-1`}>{value}</div>
    <div className="text-xs text-gray-400">{unit}</div>
  </div>
);

const DailySummaryTable: React.FC<{ data: DailySummary[] }> = ({ data }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-lg mt-8 p-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4 px-2">Daily Breakdown</h2>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {['Date', 'Steps', 'Sleep (Hrs)', 'Avg HR (BPM)', 'Processed'].map(header => (
            <th
              key={header}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item, index) => (
          <tr key={index} className="hover:bg-gray-50 transition duration-150">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {formatDate(item.summaryDate)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {item.totalSteps.toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {item.totalSleepHours.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {item.avgHeartRate.toFixed(1)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
              {new Date(item.calculationTime).toLocaleTimeString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function App() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('No summary data found for this user. Run the analytics service POST endpoint first.');
            setSummaries([]);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const data: DailySummary[] = await response.json();
          if (Array.isArray(data)) {
            setSummaries(data);
          } else {
            throw new Error('Received data is not a valid array.');
          }
        }
      } catch (e: unknown) {
        console.error("Fetch Error:", e);
        
        let errorMessage = 'An unknown error occurred.';
        if (e instanceof Error) {
            errorMessage = e.message;
        }

        setError(`Failed to fetch data. Check if the C# service is running at ${API_URL}. Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-lg font-medium text-blue-600">Loading Health Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-red-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-300">
          <h2 className="text-xl font-bold text-red-600 mb-3">Data Loading Error</h2>
          <p className="text-gray-700">{error}</p>
          <p className="mt-4 text-sm text-red-500">
            Ensure your C# Analytics Service is running at `http://localhost:5001`.
          </p>
        </div>
      </div>
    );
  }

  const chartData = formatChartData(summaries);
  
  const totalSteps = summaries.reduce((sum, item) => sum + item.totalSteps, 0);
  const avgSteps = summaries.length ? Math.round(totalSteps / summaries.length) : 0;
  
  const totalSleep = summaries.reduce((sum, item) => sum + item.totalSleepHours, 0);
  const avgSleep = summaries.length ? (totalSleep / summaries.length).toFixed(2) : 0;
  
  const totalHR = summaries.reduce((sum, item) => sum + item.avgHeartRate, 0);
  const avgHR = summaries.length ? (totalHR / summaries.length).toFixed(1) : 0;
  
  const peakSteps = summaries.length ? summaries.reduce((max, item) => Math.max(max, item.totalSteps), 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Health Tracker Dashboard
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Viewing summary for User ID: <span className="font-mono text-blue-600">user-abc-123</span>
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard 
            icon={TrendingUp} 
            title="Avg Steps" 
            value={avgSteps.toLocaleString()} 
            unit="per day" 
            color="blue"
          />
          <MetricCard 
            icon={Heart} 
            title="Avg Heart Rate" 
            value={avgHR} 
            unit="BPM (overall)" 
            color="red"
          />
          <MetricCard 
            icon={Sun} 
            title="Avg Sleep" 
            value={avgSleep} 
            unit="Hours per night" 
            color="purple"
          />
          <MetricCard 
            icon={TrendingUp} 
            title="Peak Steps" 
            value={peakSteps.toLocaleString()} 
            unit="highest single day" 
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-lg h-80">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Steps Over Time</h2>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="Steps" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSteps)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg h-80">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sleep & Heart Rate</h2>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#8b5cf6" label={{ value: 'Sleep (H)', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: '#8b5cf6'} }} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" label={{ value: 'HR (BPM)', angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fill: '#ef4444'} }} />
                <Tooltip />
                <Area yAxisId="left" type="monotone" dataKey="Sleep" stroke="#8b5cf6" fillOpacity={0.5} fill="#8b5cf6" activeDot={{ r: 6 }} />
                <Area yAxisId="right" type="monotone" dataKey="HR" stroke="#ef4444" fillOpacity={0.5} fill="#ef4444" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DailySummaryTable data={summaries} />

      </div>
    </div>
  );
}