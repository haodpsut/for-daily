import { api } from './client';
import type { ProgramDetail, RenderResult, ImpactReport } from '../types';

export interface ProgramSummary {
  code: string;
  name_vn: string;
  level: string;
}

export const getProgram = async (code: string): Promise<ProgramDetail> => {
  const { data } = await api.get(`/programs/${code}`);
  return data;
};

export const renderAll = async (code: string): Promise<RenderResult[]> => {
  const { data } = await api.post(`/render/${code}`);
  return data.results;
};

export const listPrograms = async (): Promise<ProgramSummary[]> => {
  const { data } = await api.get('/programs');
  return data;
};

export const createProgram = async (body: {
  code: string;
  name_vn: string;
  name_en?: string;
  level?: string;
  duration_years?: number;
  total_credits?: number;
  decision_no?: string;
  decision_date?: string;
  issuing_authority?: string;
}): Promise<ProgramSummary> => {
  const { data } = await api.post('/programs', body);
  return data;
};

export const deleteProgram = async (code: string): Promise<void> => {
  await api.delete(`/programs/${code}`);
};

export const getImpact = async (code: string): Promise<ImpactReport> => {
  const { data } = await api.get(`/programs/${code}/impact`);
  return data;
};
