import axios from 'axios';
import type { DailySummary } from '../types/data';

// Define the base URL for the .NET Analytics Microservice (ensure this port matches dotnet run)
const BASE_URL = 'http://localhost:5000/api/data';

// Explicitly type the api variable as AxiosInstance to satisfy TypeScript/ESLint
export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Triggers the .NET service to read raw data and calculate daily summaries.
 */
export async function triggerAnalyticsProcess(userId: string): Promise<void> {
  // POST request to /api/data/process/{userId}
  await api.post(`/process/${userId}`);
}

/**
 * Fetches the calculated daily summaries for a user.
 */
export async function getDailySummaries(userId: string): Promise<DailySummary[]> {
  // Use the Axios Generic (<DailySummary[]>) to strongly type the response data
  const response = await api.get<DailySummary[]>(`/summary/${userId}`);
  return response.data;
}

