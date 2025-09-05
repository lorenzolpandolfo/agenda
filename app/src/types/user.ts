export enum UserRole {
  PATIENT = 'PATIENT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export enum UserStatus {
  READY = 'READY',
  WAITING_VALIDATION = 'WAITING_VALIDATION'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  crp: string | null;
  phone: string | null;
  bio: string | null;
  image_url: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  crp?: string;
  bio?: string;
  image_url?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  image_url?: string;
  password?: string;
}
