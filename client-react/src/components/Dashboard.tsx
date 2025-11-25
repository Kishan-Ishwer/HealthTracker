// client-react/src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { getDailySummaries, triggerAnalyticsProcess } from '../services/api';
import type { DailySummary } from "../types/data";

const MOCK_USER_ID = "user-abc-123";

const Dashboard: React.FC = () => {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. DATA LOADING FUNCTION (must be inside the component)
  const loadSummaries = async () => {
    setLoading(true);
    setMessage('Loading summaries...');
    try {
      const data = await getDailySummaries(MOCK_USER_ID);
      setSummaries(data);
      setMessage(`Successfully loaded ${data.length} daily records.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to fetch summaries:', error.message);
      } else {
        console.error('Failed to fetch summaries:', error);
      }
      setMessage('Error loading summaries. Run Node.js ingestion first!');
    } finally {
      setLoading(false);
    }
  };
  
  // 2. DATA PROCESSING FUNCTION (must be inside the component)
  const handleProcessData = async () => {
    setMessage('Triggering analysis...');
    try {
      // Assuming triggerAnalyticsProcess is imported from '../services/api'
      await triggerAnalyticsProcess(MOCK_USER_ID); 
      setMessage('Analysis complete! Fetching new data...');
      // Wait a moment for database changes, then reload
      setTimeout(loadSummaries, 1000); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to trigger analysis:', error.message);
      } else {
        console.error('Failed to trigger analysis:', error);
      }
      setMessage('Error triggering analysis. Is the .NET service running?');
    }
  };


  // 3. EFFECT HOOK (must be inside the component)
  useEffect(() => {
    loadSummaries();
  }, []);

  // 4. RETURN STATEMENT (must be inside the component)
  return ( 
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Health Analytics Dashboard</h2>
      <p>Data from .NET Microservice (User ID: **{MOCK_USER_ID}**)</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleProcessData} disabled={loading}>
          {loading ? 'Processing...' : '1. Run Data Analysis'}
        </button>
        <button onClick={loadSummaries} disabled={loading} style={{ marginLeft: '10px' }}>
          2. Refresh Data
        </button>
      </div>

      <p style={{ fontWeight: 'bold' }}>{message}</p>

      {summaries.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Total Steps</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Sleep (Hours)</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Avg Heart Rate</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s: DailySummary) => (
              <tr key={s.summaryDate}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.summaryDate}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.totalSteps}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.totalSleepHours.toFixed(1)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{s.avgHeartRate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {summaries.length === 0 && !loading && <p>No data available. Try running the analysis.</p>}
    </div>
  );
}; // <--- END OF COMPONENT FUNCTION

export default Dashboard;

