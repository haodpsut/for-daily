import { api } from './client';
import type { ProgramDetail, RenderResult } from '../types';

export const getProgram = async (code: string): Promise<ProgramDetail> => {
  const { data } = await api.get(`/programs/${code}`);
  return data;
};

export const renderAll = async (code: string): Promise<RenderResult[]> => {
  const { data } = await api.post(`/render/${code}`);
  return data.results;
};

export const listPrograms = async (): Promise<{ code: string; name_vn: string }[]> => {
  const { data } = await api.get('/programs');
  return data;
};
