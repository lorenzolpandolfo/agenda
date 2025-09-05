import { api } from "./api";
import { useAuthStore } from "../store/auth.store";
import { userService } from "./user.service";

export function professionalService() {
  function getAuthHeaders() {
    const authStore = useAuthStore.getState();
    
    if (!authStore.accessToken) {
      throw new Error('Token de acesso não encontrado. Faça login novamente.');
    }
    
    return {
      Authorization: `Bearer ${authStore.accessToken}`
    };
  }

  async function getProfessionals(skip: number = 0, limit: number = 50) {
    try {      
      const response = await api.get('/user/all', {
        params: { role: 'PROFESSIONAL', skip, limit },
        headers: getAuthHeaders(),
      });
      
      return response.data;
    } catch (error: any) {
      
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      throw new Error(error.response?.data?.detail || 'Erro ao buscar profissionais');
    }
  }


  async function getProfessional(professionalId: string) {
    try {      
      const response = await userService().getUserData(professionalId);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar profissional');
    }
  }

  return {
    getProfessionals,
    getProfessional,
  };
}
