import { create } from "zustand";
import type { Track } from "@/types/TrackType";

export enum Mode {
  shuffle = "shuffle",
  all = "all",
}

interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLooping: boolean;
  volume: number;
  queue: Track[];
  queueIndex: number;
  mode: Mode;
  baseQueue: Track[];
  setCurrentTrack: (track: Track) => void;
  setTracks: (tracks: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setMode: (modParam: Mode) => void;
  setLooping: () => void;
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
  isLooping: false,
  volume: 0.5,
  queue: [],
  queueIndex: -1,
  mode: Mode.all,
  baseQueue: [],

  setCurrentTrack: (track) => {
    const { queue } = get();
    const index = queue.findIndex((t) => t._id === track._id);
    set({ currentTrack: track, isPlaying: true, queueIndex: index });
  },

  setTracks: (tracks) => {
    // Store the original order as baseQueue
    set({ baseQueue: tracks });
    const { mode } = get();
    if (mode === Mode.shuffle) {
      const shuffled = shuffleQueue(tracks);
      set({ queue: shuffled, queueIndex: 0 });
    } else {
      set({ queue: tracks, queueIndex: 0 });
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

  setMode: (modeParam) => {
    const { queue, mode, currentTrack, baseQueue } = get();
    if (mode === Mode.all && modeParam === Mode.shuffle) {
      // Switching from all to shuffle
      set({ mode: modeParam });
      if (queue.length > 0 && currentTrack !== null) {
        const shuffled = shuffleQueue(baseQueue);
        const currentTrackIndex = shuffled.findIndex(
          (q: Track) => q._id === currentTrack._id
        );
        set({
          queue: shuffled,
          queueIndex: currentTrackIndex,
          mode: modeParam,
        });
      } else {
        const shuffled = shuffleQueue(baseQueue);
        set({
          queue: shuffled,
          queueIndex: baseQueue.length > 0 ? 0 : -1,
          mode: modeParam,
        });
      }
    }
    if (mode === Mode.shuffle && modeParam === Mode.all) {
      // Switching from shuffle to all
      set({ mode: modeParam });
      if (baseQueue.length > 0 && currentTrack !== null) {
        const currentTrackIndex = baseQueue.findIndex(
          (q: Track) => q._id === currentTrack._id
        );
        set({
          mode: modeParam,
          queue: baseQueue,
          queueIndex: currentTrackIndex,
        });
      } else {
        set({
          mode: modeParam,
          queue: baseQueue,
          queueIndex: baseQueue.length > 0 ? 0 : -1,
        });
      }
    }
  },

  setLooping: () => {
    const { isLooping: currentLooping } = get();
    set({ isLooping: !currentLooping });
  },
}));