import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as auth from '@/lib/auth';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const response = await auth.login(email, password);
          set({ token: response.token, isAuthenticated: true });
        } catch (error) {
          set({ token: null, isAuthenticated: false });
          throw error;
        }
      },
      signup: async (username, email, password) => {
        try {
          await auth.signup(username, email, password);
          const response = await auth.login(email, password);
          set({ token: response.token, isAuthenticated: true });
        } catch (error) {
          set({ token: null, isAuthenticated: false });
          throw error;
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);