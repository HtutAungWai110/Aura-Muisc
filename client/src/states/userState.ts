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
  fetchUserData: () => Promise<void>;
  clearUserData: () => void;
}

export const useUser = create<UserState>()(

    (set) => ({
      userData: null,
      isLoading: true,
      error: null,
      fetchUserData: async () => {
        try {
          const res = await apiClient.get("/api/user/me");
          set({ userData: res.data, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
        }
      },
      clearUserData: () => set({ userData: null, isLoading: false, error: null }),
    }),

);
