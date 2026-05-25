import { create } from "zustand";

interface ErrorStore {
  errorMessage: string | null;
  setError: (message: string) => void;
  setErrorNull: () => void;
  timeoutId: number | null;
}

export const useErrorStore = create<ErrorStore>((set, get) => ({
  errorMessage: null,
  timeoutId: null,
  setError: (message: string) => {
    const timeoutId = get().timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      set({ errorMessage: null });
    }, 2000);

    set({ errorMessage: message, timeoutId: newTimeoutId });
  },

  setErrorNull: () => {
    const timeoutId = get().timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    set({ errorMessage: null, timeoutId: null });
  },
}));
