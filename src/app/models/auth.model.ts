export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
