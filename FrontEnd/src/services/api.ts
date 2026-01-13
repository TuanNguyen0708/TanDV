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

export interface DailyPlan {
  id: string;
  model: string;
  workDate: string;
  plannedDay: number;
  actualDay: number;
}

export interface MonthPlan {
  id: string;
  model: string;
  planMonth: string;
  plannedMonth: number;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  sequence: number;
  isActive: boolean;
}

export interface Model {
  modelId: string;
  name: string;
  description?: string;
}

export type StationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'STOP';

export interface ProductionStationLog {
  id: string;
  status?: StationStatus;
  reason?: string;
  startTime?: string;
  endTime?: string;
  periodMinutes?: number;
  station: Station;
}

export interface StationStatusItem {
  station: {
    id: string;
    code: string;
    name: string;
    sequence: number;
  };
  status: StationStatus | null;
  reason: string | null;
  productionNo: string | null;
}

export interface StationStatusResponse {
  stations: StationStatusItem[];
}

export interface Production {
  id: string;
  productionNo: string;
  model: string;
  productionDate: string;
  qualityStatus?: 'OK' | 'NG';
  remark?: string;
  stations: ProductionStationLog[];
}

export interface ProductionStatusResponse {
  stations: Station[];
  productions: Production[];
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

  // Get all daily plans for a date
  getAllDailyPlans: async (date: string): Promise<DailyPlan[]> => {
    const response = await api.get('/production-plan/day-all', {
      params: { date },
    });
    return response.data;
  },

  // Get all monthly plans for a month
  getAllMonthPlans: async (month: string): Promise<MonthPlan[]> => {
    const response = await api.get('/production-plan/month-all', {
      params: { month },
    });
    return response.data;
  },

  // Delete daily plan
  deleteDailyPlan: async (model: string, date: string): Promise<void> => {
    await api.delete('/production-plan/day', {
      params: { model, date },
    });
  },

  // Delete monthly plan
  deleteMonthPlan: async (model: string, month: string): Promise<void> => {
    await api.delete('/production-plan/month', {
      params: { model, month },
    });
  },
};

export const productionsApi = {
  // Get production status by date
  getStatus: async (date: string): Promise<ProductionStatusResponse> => {
    const response = await api.get('/productions/status', {
      params: { date },
    });
    return response.data;
  },

  // Get station status by date
  getStationStatus: async (date: string): Promise<StationStatusResponse> => {
    const response = await api.get('/productions/station-status', {
      params: { date },
    });
    return response.data;
  },

  // Update station status
  updateStationStatus: async (
    productionId: string,
    stationId: string,
    data: { status?: StationStatus; reason?: string }
  ): Promise<any> => {
    const response = await api.put(
      `/productions/${productionId}/stations/${stationId}/status`,
      data
    );
    return response.data;
  },

  // Update station status by date
  updateStationStatusByDate: async (
    date: string,
    stationId: string,
    data: { status?: StationStatus; reason?: string }
  ): Promise<any> => {
    const response = await api.put(
      `/productions/stations/${stationId}/status`,
      data,
      { params: { date } }
    );
    return response.data;
  },
};

export const stationsApi = {
  // Station management
  getAllStations: async (): Promise<Station[]> => {
    const response = await api.get('/stations');
    return response.data;
  },

  getStationById: async (id: string): Promise<Station> => {
    const response = await api.get(`/stations/${id}`);
    return response.data;
  },

  createStation: async (data: Omit<Station, 'id'>): Promise<Station> => {
    const response = await api.post('/stations', data);
    return response.data;
  },

  updateStation: async (id: string, data: Partial<Station>): Promise<Station> => {
    const response = await api.put(`/stations/${id}`, data);
    return response.data;
  },

  deleteStation: async (id: string): Promise<void> => {
    await api.delete(`/stations/${id}`);
  },
};

export const modelsApi = {
  // Model management
  getAllModels: async (): Promise<Model[]> => {
    const response = await api.get('/models');
    return response.data;
  },

  getModelById: async (modelId: string): Promise<Model> => {
    const response = await api.get(`/models/${modelId}`);
    return response.data;
  },

  createModel: async (data: Model): Promise<Model> => {
    const response = await api.post('/models', data);
    return response.data;
  },

  updateModel: async (modelId: string, data: Partial<Model>): Promise<Model> => {
    const response = await api.put(`/models/${modelId}`, data);
    return response.data;
  },

  deleteModel: async (modelId: string): Promise<void> => {
    await api.delete(`/models/${modelId}`);
  },
};
