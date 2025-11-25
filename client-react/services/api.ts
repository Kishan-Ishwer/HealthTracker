// client-react/src/services/api.ts
import axios from 'axios';
import { DailySummary } from './src/types/data';

const BASE_URL = 'http://localhost:5000/api/data';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- API Methods ---
export async function triggerAnalyticsProcess(userId: string): Promise<void> {
    // Post request to /api/data/process/{userID}
    await api.post(`/process/${userId}`);
}

export async function getDailySummaries(userId: string): Promise<DailySummary[]> {
    // GET request to /api/data/summary/{userId}
    const response = await api.get<DailySummary[]>(`summary/${userId}`);
    return response.data;
}