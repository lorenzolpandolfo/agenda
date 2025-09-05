import { api } from "./api";
import { useAuthStore } from "../store/auth.store";
import { User, AuthResponse, RegisterRequest } from "../types/user";

export function userService() {
  function getAuthHeaders() {
    const authStore = useAuthStore.getState();
    
    if (!authStore.accessToken) {
      throw new Error('Token de acesso não encontrado. Faça login novamente.');
    }
    
    return {
      Authorization: `Bearer ${authStore.accessToken}`
    };
  }

  async function postLogin(email: string, password: string): Promise<AuthResponse> {
    try {
      
      const response = await api.post('/user/login', {
        email,
        password
      });
      
      
      return response.data;
    } catch (error: any) {
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          throw new Error('Email ou senha incorretos');
        }
        
        throw new Error(data?.detail || data?.error || `Erro ${status}: ${data}`);
      } else if (error.request) {
        throw new Error('Erro de conexão com o servidor');
      } else {
        throw new Error(error.message || 'Erro desconhecido');
      }
    }
  }

  async function postRegister(userData: RegisterRequest): Promise<User> {
    try {
      
      const response = await api.post('/user/register', userData);
      
      
      return response.data;
    } catch (error: any) {
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data?.detail || 'Dados inválidos');
        }
        
        throw new Error(data?.detail || data?.error || `Erro ${status}: ${data}`);
      } else if (error.request) {
        throw new Error('Erro de conexão com o servidor');
      } else {
        throw new Error(error.message || 'Erro desconhecido');
      }
    }
  }

  async function getUserData(userId?: string): Promise<User> {
    try {
      const url = userId ? `/user?user_id=${userId}` : '/user';
      
      const response = await api.get(url, {
        headers: getAuthHeaders()
      });
      
      
      return response.data;
    } catch (error: any) {
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          useAuthStore.getState().logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        throw new Error(data?.detail || data?.error || `Erro ${status}: ${data}`);
      } else if (error.request) {
        throw new Error('Erro de conexão com o servidor');
      } else {
        throw new Error(error.message || 'Erro desconhecido');
      }
    }
  }

  async function getAllUsers(role?: 'PATIENT' | 'PROFESSIONAL', skip: number = 0, limit: number = 50): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (role) {
        queryParams.append('role', role);
      }
      
      queryParams.append('skip', skip.toString());
      queryParams.append('limit', limit.toString());

      const url = `/user/all?${queryParams.toString()}`;
      
      const response = await api.get(url, {
        headers: getAuthHeaders()
      });
      
      
      return response.data;
    } catch (error: any) {
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          useAuthStore.getState().logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        throw new Error(data?.detail || data?.error || `Erro ${status}: ${data}`);
      } else if (error.request) {
        throw new Error('Erro de conexão com o servidor');
      } else {
        throw new Error(error.message || 'Erro desconhecido');
      }
    }
  }

  return {
    postLogin,
    postRegister,
    getUserData,
    getAllUsers,
  };
}
