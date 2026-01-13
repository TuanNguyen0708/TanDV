import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateMonthPlanDto {
  model: string;
  month: string; // YYYY-MM
  plannedMonth: number;
}

export interface CreateDailyResultDto {
  model: string;
  date: string; // YYYY-MM-DD
  plannedDay: number;
  actualDay?: number;
}

export interface SummaryRow {
  model: string;
  plannedDay: number;
  actualDay: number;
  plannedMonth: number;
  cumulative: number;
}

export interface SummaryResponse {
  date: string;
  rows: SummaryRow[];
  total: {
    plannedDay: number;
    actualDay: number;
    plannedMonth: number;
    cumulative: number;
  };
}

export const productionPlansApi = {
  // Create or update monthly plan
  upsertMonthPlan: async (data: CreateMonthPlanDto) => {
    const response = await api.post('/production-plan/month', data);
    return response.data;
  },

  // Create or update daily result
  upsertDailyResult: async (data: CreateDailyResultDto) => {
    const response = await api.post('/production-plan/day', data);
    return response.data;
  },

  // Get daily summary
  getDailySummary: async (date: string): Promise<SummaryResponse> => {
    const response = await api.get('/production-plan/summary', {
      params: { date },
    });
    return response.data;
  },
};
