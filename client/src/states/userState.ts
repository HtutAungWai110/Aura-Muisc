import { create } from "zustand";
import apiClient from "../lib/apiClient";

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
    try {
      const res = await apiClient.get("/api/user/me", {
        withCredentials: true,
      });
      set({ userData: res.data, isLoading: false });
    } catch (e) {
      // Error is already set by the interceptor in apiClient
      set({ isLoading: false });
    }
  },
}));
