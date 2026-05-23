import { create } from "zustand";

type UserSchema = {
  avatar: string;
  createdAt: string;
  displayName: string;
  email: string;
  provider: string;
  providerId: string;
  __v: number;
  _id: string;
};

interface UserState {
  userData: UserSchema | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: () => void;
}

export const useUser = create<UserState>((set) => ({
  userData: null,
  isLoading: true,
  error: null,
  fetchUserData: async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      const data = await res.json();
      set({ isLoading: false, error: data.message });
      return;
    }
    const data = await res.json();
    set({ isLoading: false, userData: data.user });
  },
}));
