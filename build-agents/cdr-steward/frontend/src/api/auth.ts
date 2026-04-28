import { api } from './client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  institution_name: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const register = async (body: {
  email: string;
  password: string;
  full_name?: string;
  institution_name?: string;
}): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/register', body);
  return data;
};

export const me = async (): Promise<AuthUser> => {
  const { data } = await api.get('/auth/me');
  return data;
};
