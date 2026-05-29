import { create } from "zustand";
import axios from "axios";

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
      const res = await axios.get("/api/user/me", { withCredentials: true });
      const { user } = res.data;
      set({ userData: user, isLoading: false });
    } catch (e) {
      if (e.response) {
        set({
          error: `Error: ${e.response.status}, ${e.response.data.message}`,
          isLoading: false,
        });
      }
    }
  },
}));
