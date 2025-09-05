import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  
  user: User | null;
  
  loading: boolean;
  
  setAuthData: (accessToken: string, refreshToken: string, userId: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
  
  isAuthenticated: () => boolean;
  getAuthHeaders: () => { Authorization: string } | {};
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      user: null,
      loading: false,

      setAuthData: (accessToken: string, refreshToken: string, userId: string) => {
        set({
          accessToken,
          refreshToken,
          userId,
          loading: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          user: null,
          loading: false,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          user: null,
          loading: false,
        });
      },

      isAuthenticated: () => {
        const state = get();
        return !!(state.accessToken && state.userId);
      },

      getAuthHeaders: () => {
        const state = get();
        if (state.accessToken) {
          return { Authorization: `Bearer ${state.accessToken}` };
        }
        return {};
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        user: state.user,
      }),
    }
  )
);
