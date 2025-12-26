import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthResponse } from '../../shared/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthResponse['user']) => void;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

