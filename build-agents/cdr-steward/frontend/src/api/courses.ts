import { api } from './client';
import type { CourseDetail, Course, CLO, IRMALevel } from '../types';

export const getCourse = async (id: string): Promise<CourseDetail> => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const updateCourse = async (
  id: string,
  body: Partial<{
    code: string; name_vn: string; name_en: string;
    credits: number; hours_lt: number; hours_th: number; hours_self: number;
    knowledge_group: string; semester_default: number; description: string;
  }>
): Promise<Course> => {
  const { data } = await api.put(`/courses/${id}`, body);
  return data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await api.delete(`/courses/${id}`);
};

export const createCourse = async (
  programCode: string,
  body: {
    code: string; name_vn: string; name_en?: string;
    credits?: number; hours_lt?: number; hours_th?: number;
    knowledge_group?: string; semester_default?: number;
  }
): Promise<Course> => {
  const { data } = await api.post(`/programs/${programCode}/courses`, body);
  return data;
};

export const createCLO = async (
  courseId: string,
  body: { code: string; text_vn: string }
): Promise<CLO> => {
  const { data } = await api.post(`/courses/${courseId}/clos`, body);
  return data;
};

export const updateCLO = async (
  id: string,
  body: { code?: string; text_vn?: string }
): Promise<CLO> => {
  const { data } = await api.put(`/clos/${id}`, body);
  return data;
};

export const deleteCLO = async (id: string): Promise<void> => {
  await api.delete(`/clos/${id}`);
};

export const setCLOPIMapping = async (
  cloId: string,
  levels: Record<string, IRMALevel | string>
): Promise<{ ok: boolean; mapped_count: number }> => {
  const { data } = await api.put(`/clos/${cloId}/pi-mapping`, { levels });
  return data;
};
