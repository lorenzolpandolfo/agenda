import { api } from "./api";
import { useAuthStore } from "../store/auth.store";
import { 
  Availability, 
  Schedule, 
  CreateAvailabilityRequest, 
  ChangeAvailabilityStatusRequest,
  CreateScheduleRequest,
  GetAvailabilitiesParams,
  GetSchedulesParams
} from "../types/schedule";

export function scheduleService() {
  function getAuthHeaders() {
    const authStore = useAuthStore.getState();
    
    if (!authStore.accessToken) {
      throw new Error('Token de acesso não encontrado. Faça login novamente.');
    }
    
    return {
      Authorization: `Bearer ${authStore.accessToken}`
    };
  }

  async function createSchedule(availabilityId: string): Promise<{ schedule_id: string }> {
    try {      
      
      const requestData: CreateScheduleRequest = {
        availability_id: availabilityId
      };
      
      const response = await api.post<{ schedule_id: string }>('/schedule', requestData, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('💥 Erro ao criar agendamento:', error);
      
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      throw new Error(error.response?.data?.detail || 'Erro ao criar agendamento');
    }
  }

  async function getSchedules(timeFilter: string = 'ALL'): Promise<Schedule[]> {
    try {      
      const response = await api.get<Schedule[]>('/schedule', {
        params: { time_filter: timeFilter },
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('💥 Erro ao carregar agendamentos:', error);
      
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      throw new Error(error.response?.data?.detail || 'Erro ao carregar agendamentos');
    }
  }

  async function getAvailabilities(params: GetAvailabilitiesParams): Promise<Availability[]> {
    try {      
      const response = await api.get<Availability[]>('/availabilities', {
        params,
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('💥 Erro ao carregar horários:', error);
      
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (error.response?.status === 400 && error.response?.data?.detail === "No availabilities found.") {
        return [];
      }
      
      throw new Error(error.response?.data?.detail || 'Erro ao carregar horários');
    }
  }

  async function createAvailability(requestData: CreateAvailabilityRequest): Promise<{ availability_id: string }> {
    try {      
      const response = await api.post<{ availability_id: string }>('/availabilities', requestData, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('💥 Erro ao criar horário:', error);
      
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      throw new Error(error.response?.data?.detail || 'Erro ao criar horário');
    }
  }

  async function changeAvailabilityStatus(requestData: ChangeAvailabilityStatusRequest): Promise<Availability> {
    try {      
      const response = await api.post<Availability>('/availabilities/change-status', requestData, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('💥 Erro ao alterar status:', error);
      
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      throw new Error(error.response?.data?.detail || 'Erro ao alterar status');
    }
  }

  return {
    createSchedule,
    getSchedules,
    getAvailabilities,
    createAvailability,
    changeAvailabilityStatus,
  };
}
