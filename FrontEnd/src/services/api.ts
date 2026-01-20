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
  monthPlanId: string;
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
  stationName: string;
  description?: string;
  isActive: boolean;
  currentStatusCode: StationStatusCode;
  currentStatusBrief?: string;
}

export enum StationStatusCode {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  STOP = 'STOP',
  EMERGENCY = 'EMERGENCY',
}

export interface Model {
  modelId: string;
  name: string;
  description?: string;
}

export type StationStatus = 'NOT_START' | 'PENDING' | 'RUNNING' | 'STOP';

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
  deleteDailyPlan: async (id: string): Promise<void> => {
    await api.delete(`/production-plan/day/${id}`);
  },

  // Delete monthly plan
  deleteMonthPlan: async (id: string): Promise<void> => {
    await api.delete(`/production-plan/month/${id}`);
  },
};

// ⚠️ DEPRECATED - These APIs no longer exist in the backend
// Use productionStatusApi and stationsApi instead
/* eslint-disable @typescript-eslint/no-unused-vars */
export const productionsApi = {
  // ❌ OLD API - Backend endpoint removed
  getStatus: async (..._args: unknown[]): Promise<ProductionStatusResponse> => {
    throw new Error('API removed: Use productionStatusApi.getAll() instead');
  },

  // ❌ OLD API - Backend endpoint removed
  getStationStatus: async (..._args: unknown[]): Promise<StationStatusResponse> => {
    throw new Error('API removed: Use stationsApi.getAllStations() instead');
  },

  // ❌ OLD API - Backend endpoint removed
  updateStationStatus: async (..._args: unknown[]): Promise<void> => {
    throw new Error('API removed: Update logic needed for new backend structure');
  },

  // ❌ OLD API - Backend endpoint removed
  updateStationStatusByDate: async (..._args: unknown[]): Promise<void> => {
    throw new Error('API removed: Update logic needed for new backend structure');
  },
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export const stationsApi = {
  // Station management
  getAllStations: async (): Promise<Station[]> => {
    const response = await api.get('/station');
    return response.data;
  },

  getStationById: async (id: string): Promise<Station> => {
    const response = await api.get(`/station/${id}`);
    return response.data;
  },

  createStation: async (data: Omit<Station, 'id'>): Promise<Station> => {
    const response = await api.post('/station', data);
    return response.data;
  },

  updateStation: async (id: string, data: Partial<Station>): Promise<Station> => {
    const response = await api.patch(`/station/${id}`, data);
    return response.data;
  },

  deleteStation: async (id: string): Promise<void> => {
    await api.delete(`/station/${id}`);
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

// ========== NEW APIS FOR NEW DATABASE STRUCTURE ==========

export interface ProductionStatus {
  id: string;
  modelID: string;
  vehicleID: string;
  productionDate: string;
  stationStart?: string;
  stationEnd?: string;
  quality?: 'OK' | 'NG';
  remark?: string;
}

export interface StationDailyStatus {
  id: string;
  stationID: string;
  statusDate: string;
  startTime?: string;
  stopTime?: string;
  totalDowntime?: number;
  station?: Station;
}

export interface StationDowntimeLog {
  id: string;
  stationDailyID: string;
  downTimeLog?: string;
  downtimeStart?: string;
  downtimeStop?: string;
  stationDailyStatus?: StationDailyStatus;
}

export const productionStatusApi = {
  // Production Status management
  getAll: async (): Promise<ProductionStatus[]> => {
    const response = await api.get('/production-status');
    return response.data;
  },

  getById: async (id: string): Promise<ProductionStatus> => {
    const response = await api.get(`/production-status/${id}`);
    return response.data;
  },

  create: async (data: Omit<ProductionStatus, 'id'>): Promise<ProductionStatus> => {
    const response = await api.post('/production-status', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProductionStatus>): Promise<ProductionStatus> => {
    const response = await api.patch(`/production-status/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/production-status/${id}`);
  },
};

export const stationDailyStatusApi = {
  // Station Daily Status management
  getAll: async (): Promise<StationDailyStatus[]> => {
    const response = await api.get('/station-daily-status');
    return response.data;
  },

  getById: async (id: string): Promise<StationDailyStatus> => {
    const response = await api.get(`/station-daily-status/${id}`);
    return response.data;
  },

  getByStation: async (stationId: string): Promise<StationDailyStatus[]> => {
    const response = await api.get(`/station-daily-status/station/${stationId}`);
    return response.data;
  },

  create: async (data: Omit<StationDailyStatus, 'id'>): Promise<StationDailyStatus> => {
    const response = await api.post('/station-daily-status', data);
    return response.data;
  },

  update: async (id: string, data: Partial<StationDailyStatus>): Promise<StationDailyStatus> => {
    const response = await api.patch(`/station-daily-status/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/station-daily-status/${id}`);
  },
};

export const stationDowntimeLogApi = {
  // Station Downtime Log management
  getAll: async (): Promise<StationDowntimeLog[]> => {
    const response = await api.get('/station-downtime-log');
    return response.data;
  },

  getById: async (id: string): Promise<StationDowntimeLog> => {
    const response = await api.get(`/station-downtime-log/${id}`);
    return response.data;
  },

  getByStationDaily: async (stationDailyId: string): Promise<StationDowntimeLog[]> => {
    const response = await api.get(`/station-downtime-log/station-daily/${stationDailyId}`);
    return response.data;
  },

  create: async (data: Omit<StationDowntimeLog, 'id'>): Promise<StationDowntimeLog> => {
    const response = await api.post('/station-downtime-log', data);
    return response.data;
  },

  update: async (id: string, data: Partial<StationDowntimeLog>): Promise<StationDowntimeLog> => {
    const response = await api.patch(`/station-downtime-log/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/station-downtime-log/${id}`);
  },
};
