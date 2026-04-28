/**
 * Measurement API — đo CLO/PLO từ điểm sinh viên.
 * Backend prefix: /measurement (sau /api → đầy đủ /api/measurement/...)
 */
import { api } from './client';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export type SessionStatus = 'DRAFT' | 'SCORING' | 'COMPUTED' | 'PUBLISHED';
export type BloomLevel =
  | 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
export type RubricLevelEnum = 'EXCELLENT' | 'GOOD' | 'PASS' | 'FAIL';

export interface MeasSessionListItem {
  id: string;
  name: string;
  course_id: string;
  course_code?: string;
  course_name?: string;
  semester: string;
  cohort_code: string;
  status: SessionStatus;
  n_questions: number;
  n_students: number;
  updated_at: string;
}

export interface MeasSessionDetail {
  id: string;
  program_id: string;
  course_id: string;
  assessment_id: string | null;
  name: string;
  semester: string;
  cohort_code: string;
  exam_date: string | null;
  max_total_score: string;
  pass_threshold: string;
  clo_threshold_pct: string;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface MeasSessionCreate {
  program_id: string;
  course_id: string;
  assessment_id?: string | null;
  name: string;
  semester: string;
  cohort_code: string;
  exam_date?: string;
  max_total_score?: string;
  pass_threshold?: string;
  clo_threshold_pct?: string;
}

export interface MeasQuestionCLOLink {
  clo_id: string;
  weight: string;
}

export interface MeasQuestion {
  id: string;
  session_id: string;
  number: string;
  order: number;
  text: string | null;
  max_score: string;
  bloom_level: BloomLevel | null;
  weight_in_session: string | null;
  clo_links: MeasQuestionCLOLink[];
}

export interface MeasStudent {
  id: string;
  program_id: string;
  code: string;
  full_name: string;
  date_of_birth: string | null;
  cohort_code: string | null;
  email: string | null;
}

export interface ResultCLO {
  session_id: string;
  clo_id: string;
  clo_code: string | null;
  clo_text: string | null;
  n_students: number;
  n_achieved: number;
  pct_achieved: string;
  avg_score_pct: string;
  computed_at: string;
}

export interface ResultPLO {
  session_id: string;
  plo_id: string;
  plo_code: string | null;
  plo_text: string | null;
  pi_count: number;
  pct_achieved: string;
  computed_at: string;
}

export interface ComputeResponse {
  session_id: string;
  n_students_total: number;
  n_questions_total: number;
  n_clos_evaluated: number;
  n_plos_evaluated: number;
  clo_results: ResultCLO[];
  plo_results: ResultPLO[];
  warnings: string[];
}

export interface ImportSummary {
  students_created: number;
  students_updated: number;
  students_enrolled: number;
  questions_created: number;
  questions_updated: number;
  scores_created: number;
  scores_updated: number;
  warnings: string[];
}

// ─────────────────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────────────────
export const listSessions = async (params?: {
  program_id?: string;
  course_id?: string;
}): Promise<MeasSessionListItem[]> => {
  const { data } = await api.get('/measurement/sessions', { params });
  return data;
};

export const getSession = async (id: string): Promise<MeasSessionDetail> => {
  const { data } = await api.get(`/measurement/sessions/${id}`);
  return data;
};

export const createSession = async (
  body: MeasSessionCreate,
): Promise<MeasSessionDetail> => {
  const { data } = await api.post('/measurement/sessions', body);
  return data;
};

export const deleteSession = async (id: string): Promise<void> => {
  await api.delete(`/measurement/sessions/${id}`);
};

export const listQuestions = async (sessionId: string): Promise<MeasQuestion[]> => {
  const { data } = await api.get(`/measurement/sessions/${sessionId}/questions`);
  return data;
};

export const listSessionStudents = async (
  sessionId: string,
): Promise<MeasStudent[]> => {
  const { data } = await api.get(`/measurement/sessions/${sessionId}/students`);
  return data;
};

export const computeSession = async (id: string): Promise<ComputeResponse> => {
  const { data } = await api.post(`/measurement/sessions/${id}/compute`);
  return data;
};

export const getCachedResults = async (id: string): Promise<ComputeResponse> => {
  const { data } = await api.get(`/measurement/sessions/${id}/results`);
  return data;
};

export const importGradebook = async (
  sessionId: string,
  file: File,
): Promise<ImportSummary> => {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post(`/measurement/sessions/${sessionId}/import`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// File downloads (attach Bearer)
async function _downloadAs(path: string, filename: string): Promise<void> {
  const { data } = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

export const downloadScoresCsv = (sid: string, fname = 'scores.csv') =>
  _downloadAs(`/measurement/sessions/${sid}/export/scores.csv`, fname);
export const downloadCloMasteryCsv = (sid: string, fname = 'clo_mastery.csv') =>
  _downloadAs(`/measurement/sessions/${sid}/export/clo_mastery.csv`, fname);
export const downloadEvidenceCsv = (sid: string, fname = 'evidence.csv') =>
  _downloadAs(`/measurement/sessions/${sid}/export/evidence.csv`, fname);

export const generateTt04Report = async (sid: string) => {
  const { data } = await api.post(`/measurement/sessions/${sid}/report/tt04`);
  return data as { session_id: string; tex_path: string; pdf_path: string | null; pdf_available: boolean };
};

export const downloadTt04Pdf = (sid: string, fname = 'tt04_report.pdf') =>
  _downloadAs(`/measurement/sessions/${sid}/report/tt04.pdf`, fname);

export const downloadTt04Tex = (sid: string, fname = 'tt04_report.tex') =>
  _downloadAs(`/measurement/sessions/${sid}/report/tt04.tex`, fname);
