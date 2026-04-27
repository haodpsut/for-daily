export interface PI {
  id: string;
  code: string;
  text_vn: string;
  text_en?: string | null;
  order: number;
}

export interface PLO {
  id: string;
  code: string;
  text_vn: string;
  text_en?: string | null;
  order: number;
  pis: PI[];
  po_codes: string[];
}

export interface PO {
  id: string;
  code: string;
  text_vn: string;
  order: number;
}

export interface CLO {
  id: string;
  code: string;
  text_vn: string;
  order: number;
}

export interface Course {
  id: string;
  code: string;
  name_vn: string;
  name_en?: string | null;
  credits: number;
  hours_lt: number;
  hours_th: number;
  knowledge_group: string;
  semester_default?: number | null;
  description?: string | null;
  clos_count: number;
}

export interface ProgramDetail {
  id: string;
  code: string;
  name_vn: string;
  name_en?: string | null;
  level: string;
  duration_years: number;
  total_credits?: number | null;
  decision_no?: string | null;
  decision_date?: string | null;
  issuing_authority?: string | null;
  version: number;
  pos: PO[];
  plos: PLO[];
  courses: Course[];
  counts: {
    pos: number;
    plos: number;
    pis: number;
    courses: number;
    clos: number;
  };
}

export interface RenderResult {
  template: string;
  pdf_filename: string;
  pdf_url: string;
}

export type TemplateStatus = 'fresh' | 'stale' | 'missing';

export interface TemplateImpact {
  name: string;
  status: TemplateStatus;
  rendered_at: string | null;
  pdf_url: string | null;
}

export interface ImpactReport {
  program_code: string;
  program_version: number;
  program_updated_at: string;
  last_rendered_version: number | null;
  last_rendered_at: string | null;
  is_stale_overall: boolean;
  counts: { fresh: number; stale: number; missing: number };
  program_templates: TemplateImpact[];
  decuong_templates: TemplateImpact[];
}
