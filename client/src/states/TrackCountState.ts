import apiClient from "@/lib/apiClient";
import { create } from "zustand";

interface TracksCountStore {
  tracksCount: number | null;
  getTracksCount: () => void;
  setTracksCount: (payload: number) => void;
}

export const useTracksCountStore = create<TracksCountStore>((set) => ({
  tracksCount: null,
  getTracksCount: async () => {
    try {
      const res = await apiClient.get("/api/track/all/count", {
        withCredentials: true,
      });
      const { tracksCount } = res.data;
      set({ tracksCount: tracksCount });
    } catch (error) {
      // Error is already set by the interceptor in apiClient
      // tracksCount remains null or unchanged
    }
  },
  setTracksCount: (payload) => {
    set({ tracksCount: payload });
  },
}));
