import { apiClient } from './client';
import type { User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthorityRegisterPayload {
  email: string;
  password: string;
  full_name: string;
  department: string;
  access_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
  dev_reset_link?: string;
  dev_reset_token?: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register', payload);
    return res.data;
  },

  registerAuthority: async (payload: AuthorityRegisterPayload): Promise<User> => {
    const res = await apiClient.post<User>('/auth/register/authority', payload);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const res = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const res = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', payload);
    return res.data;
  },
};
