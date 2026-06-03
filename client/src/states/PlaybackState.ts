import { create } from "zustand";
import type { Track } from "@/components/TrackTemplate";

interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  tracks: Track[];
  queueIndex: number;

  setCurrentTrack: (track: Track) => void;
  setTracks: (tracks: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const usePlaybackState = create<PlaybackState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  tracks: [],
  queueIndex: -1,

  setCurrentTrack: (track) => {
    const { tracks } = get();
    const index = tracks.findIndex((t) => t._id === track._id);
    set({ currentTrack: track, isPlaying: true, queueIndex: index });
  },

  setTracks: (tracks) => set({ tracks }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setVolume: (volume) => set({ volume }),

  nextTrack: () => {
    const { tracks, queueIndex } = get();
    if (tracks.length === 0) return;
    const nextIndex = (queueIndex + 1) % tracks.length;
    set({
      currentTrack: tracks[nextIndex],
      queueIndex: nextIndex,
      isPlaying: true,
    });
  },

  prevTrack: () => {
    const { tracks, queueIndex } = get();
    if (tracks.length === 0) return;
    const prevIndex = (queueIndex - 1 + tracks.length) % tracks.length;
    set({
      currentTrack: tracks[prevIndex],
      queueIndex: prevIndex,
      isPlaying: true,
    });
  },
}));
