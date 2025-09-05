export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  TAKEN = 'TAKEN',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export enum TimeFilter {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  ALL = 'ALL'
}

export interface User {
  id: string;
  name: string;
  bio: string | null;
  email: string;
  role: 'PATIENT' | 'PROFESSIONAL';
  status: 'READY' | 'WAITING_VALIDATION';
  crp: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Availability {
  id: string;
  start_time: string;
  end_time: string;
  status: AvailabilityStatus;
  owner_id: string;
  created_at: string;
  user?: User;
}

export interface Schedule {
  id: string;
  professional_id: string;
  patient_id: string;
  availability_id: string;
  status: AvailabilityStatus;
  start_time: string;
  created_at: string;
  user?: User;
}

export interface CreateAvailabilityRequest {
  start_time: string;
  end_time: string;
  status: AvailabilityStatus;
}

export interface ChangeAvailabilityStatusRequest {
  availability_id: string;
  status: AvailabilityStatus;
}

export interface CreateScheduleRequest {
  availability_id: string;
}

export interface GetAvailabilitiesParams {
  professional_id?: string; // Opcional - se não especificado, busca de todos os profissionais
  time_filter?: TimeFilter;
  status?: AvailabilityStatus;
  skip?: number;
  limit?: number;
}

export interface GetSchedulesParams {
  time_filter?: TimeFilter;
}
