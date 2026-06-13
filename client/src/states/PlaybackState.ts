import { create } from "zustand";
import type { Track } from "@/types/TrackType";

export enum Mode {
  shuffle = "shuffle",
  all = "all",
  loop = "loop",
}

interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  queueIndex: number;
  setCurrentTrack: (track: Track) => void;
  setTracks: (tracks: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  mode: Mode;
  setMode: (modParam: Mode) => void;
}

const shuffleQueue = (queue: Track[]): Track[] => {
  const shuffled = [...queue];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePlaybackState = create<PlaybackState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  queue: [],
  queueIndex: -1,
  mode: Mode.all,

  setCurrentTrack: (track) => {
    const { queue } = get();
    const index = queue.findIndex((t) => t._id === track._id);
    set({ currentTrack: track, isPlaying: true, queueIndex: index });
  },

  setTracks: (tracks) => {
    const { mode } = get();
    if (mode === Mode.shuffle) {
      const shuffled = shuffleQueue(tracks);
      set({ queue: shuffled, queueIndex: 0 });
    } else {
      set({ queue: tracks });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setVolume: (volume) => set({ volume }),

  nextTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const nextIndex = (queueIndex + 1) % queue.length;
    set({
      currentTrack: queue[nextIndex],
      queueIndex: nextIndex,
      isPlaying: true,
    });
  },

  prevTrack: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    set({
      currentTrack: queue[prevIndex],
      queueIndex: prevIndex,
      isPlaying: true,
    });
  },
  setMode: (modParam) => {
    set({ mode: modParam });
    const { mode, queue, isPlaying } = get();
    if (mode === Mode.shuffle && queue.length > 0 && isPlaying) {
      const shuffled = shuffleQueue(queue);
      set({ queue: shuffled, queueIndex: 0 });
    }
  },
}));
