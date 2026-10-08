import { apiClient } from './client';
import type { 
  Report, 
  DashboardStats, 
  ReportStatus, 
  PriorityLevel,
  ImpactForecast, 
  RepairSimulationResult, 
  MunicipalWorkOrder 
} from '../types';

export interface ReportFilterParams {
  mine_only?: boolean;
  category?: string;
  status?: string;
  priority?: string;
  accessibility_only?: boolean;
  sort_by?: 'impact' | 'priority' | 'severity' | 'created_at';
}

export interface UpdateStatusPayload {
  status: ReportStatus;
  impact_notes?: string;
  human_impact_score?: number;
  priority_level?: PriorityLevel;
}

export const reportsApi = {
  createReport: async (formData: FormData): Promise<Report> => {
    const res = await apiClient.post<Report>('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getReports: async (params?: ReportFilterParams): Promise<Report[]> => {
    const res = await apiClient.get<Report[]>('/reports', { params });
    return res.data;
  },

  getReportById: async (id: number): Promise<Report> => {
    const res = await apiClient.get<Report>(`/reports/${id}`);
    return res.data;
  },

  updateReportStatus: async (id: number, payload: UpdateStatusPayload): Promise<Report> => {
    const res = await apiClient.patch<Report>(`/reports/${id}/status`, payload);
    return res.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/reports/stats/dashboard');
    return res.data;
  },

  getImpactForecast: async (id: number): Promise<ImpactForecast> => {
    const res = await apiClient.get<ImpactForecast>(`/reports/${id}/forecast`);
    return res.data;
  },

  simulateRepair: async (id: number): Promise<RepairSimulationResult> => {
    const res = await apiClient.post<RepairSimulationResult>(`/reports/${id}/simulate-repair`);
    return res.data;
  },

  getWorkOrder: async (id: number): Promise<MunicipalWorkOrder> => {
    const res = await apiClient.get<MunicipalWorkOrder>(`/reports/${id}/work-order`);
    return res.data;
  },
};
