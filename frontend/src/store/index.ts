import { create } from 'zustand';
import { User } from '../types';

interface AppStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  updateUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
