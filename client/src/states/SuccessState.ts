import { time } from "motion/react";
import { create } from "zustand";

interface SuccessStore {
  successMessage: string | null;
  timeoutId: number | null;
  setSuccessMessage: (message: string) => void;
  setSuccessMessageNull: () => void;
}

export const useSuccessStore = create<SuccessStore>((set, get) => ({
  successMessage: null,
  timeoutId: null,
  setSuccessMessage: (message) => {
    let timeoutId = get().timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      set({ successMessage: null });
    }, 2000);
    set({ successMessage: message, timeoutId: timeoutId });
  },
  setSuccessMessageNull: () => {
    set({ successMessage: null, timeoutId: null });
  },
}));
