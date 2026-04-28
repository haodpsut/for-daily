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

// PDF download helpers — backend yêu cầu Bearer token (anchor tag không gửi),
// nên fetch via axios + blob URL.

const _fetchPdfBlob = async (pdfUrl: string): Promise<string> => {
  // pdfUrl từ backend dạng "/api/render/{code}/files/{name}.pdf"
  // axios baseURL đã là "/api" hoặc "https://...onrender.com/api" → strip "/api" prefix
  const path = pdfUrl.startsWith('/api') ? pdfUrl.slice(4) : pdfUrl;
  const { data } = await api.get(path, { responseType: 'blob' });
  return URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
};

export const openPdf = async (pdfUrl: string): Promise<void> => {
  const blobUrl = await _fetchPdfBlob(pdfUrl);
  window.open(blobUrl, '_blank');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};

export const downloadPdf = async (pdfUrl: string, filename: string): Promise<void> => {
  const blobUrl = await _fetchPdfBlob(pdfUrl);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5_000);
};
