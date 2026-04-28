import { api } from './client';
import type { PLO, PI } from '../types';

export const updatePLO = async (
  id: string,
  body: { code?: string; text_vn?: string; text_en?: string }
): Promise<PLO> => {
  const { data } = await api.put(`/plos/${id}`, body);
  return data;
};

export const deletePLO = async (id: string): Promise<void> => {
  await api.delete(`/plos/${id}`);
};

export const createPLO = async (
  programCode: string,
  body: { code: string; text_vn: string; text_en?: string }
): Promise<PLO> => {
  const { data } = await api.post(`/programs/${programCode}/plos`, body);
  return data;
};

export const updatePI = async (
  id: string,
  body: { code?: string; text_vn?: string; text_en?: string }
): Promise<PI> => {
  const { data } = await api.put(`/pis/${id}`, body);
  return data;
};

export const deletePI = async (id: string): Promise<void> => {
  await api.delete(`/pis/${id}`);
};

export const createPI = async (
  ploId: string,
  body: { code: string; text_vn: string; text_en?: string }
): Promise<PI> => {
  const { data } = await api.post(`/plos/${ploId}/pis`, body);
  return data;
};

export const updatePLOPOMapping = async (
  ploId: string,
  poCodes: string[]
): Promise<{ ok: boolean; plo_code: string; po_codes: string[] }> => {
  const { data } = await api.put(`/plos/${ploId}/po-mapping`, { po_codes: poCodes });
  return data;
};

export interface ImportResult {
  imported?: Record<string, number>;
  warnings: string[];
  errors: string[];
}

export const importExcel = async (file: File): Promise<ImportResult> => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/import/excel', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const importDocx = async (file: File): Promise<ImportResult> => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/import/docx', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
