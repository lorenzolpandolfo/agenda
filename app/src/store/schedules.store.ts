import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule, Availability } from '../types/schedule';

interface SchedulesState {
  // Estado
  schedules: Schedule[];
  availabilities: Availability[];
  loading: boolean;
  
  // Ações
  setSchedules: (schedules: Schedule[]) => void;
  setAvailabilities: (availabilities: Availability[]) => void;
  addSchedule: (schedule: Schedule) => void;
  updateAvailabilityStatus: (availabilityId: string, status: string) => void;
  setLoading: (loading: boolean) => void;
  clearScheduleData: () => void;
}

export const useSchedulesStore = create<SchedulesState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      schedules: [],
      availabilities: [],
      loading: false,

      // Ações
      setSchedules: (schedules: Schedule[]) => {
        set({ schedules });
      },

      setAvailabilities: (availabilities: Availability[]) => {
        set({ availabilities });
      },

      addSchedule: (schedule: Schedule) => {
        const currentSchedules = get().schedules;
        set({ schedules: [...currentSchedules, schedule] });
      },

      updateAvailabilityStatus: (availabilityId: string, status: string) => {
        const currentAvailabilities = get().availabilities;
        const updatedAvailabilities = currentAvailabilities.map(av => 
          av.id === availabilityId ? { ...av, status: status as any } : av
        );
        set({ availabilities: updatedAvailabilities });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      clearScheduleData: () => {
        set({
          schedules: [],
          availabilities: [],
          loading: false,
        });
      },
    }),
    {
      name: 'schedules-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        schedules: state.schedules,
        availabilities: state.availabilities,
      }),
    }
  )
);
