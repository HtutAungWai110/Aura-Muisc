import { create } from "zustand";
import type { Playlist } from "@/types/PlaylistType";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";

interface PlaylistStore {
  playlists: Playlist[] | [];
  currentPage: number;
  totalPages: number;
  isPending: boolean;
  isLoadingMore: boolean;
  error: string | null;
  fetchPlaylists: (page?: number) => void;
  setPlaylists: (payload: Playlist[]) => void;
  addPlaylist: (payload: Playlist) => void;
  addMissingPlaylists: (payload: Playlist[]) => void;
  getPlaylist: (id: string) => Playlist;
  updatePlaylist: (id: string, payload: Playlist) => void;
  addTrack: (id: string, payload: Track) => void;
  removeTrack: (id: string, trackId: string) => void;
  trackExist: (id: string, trackId: string) => boolean;
  removeTrackAfterDelete: (trackId: string) => void;
  removePlaylist: (id: string) => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  currentPage: 1,
  totalPages: 1,
  isPending: true,
  isLoadingMore: false,
  error: null,
  fetchPlaylists: async (page = 1) => {
    try {
      if (page > 1) {
        set({ isLoadingMore: true });
      } else {
        set({ isPending: true });
      }

      const res = await apiClient.get(
        `/api/playlist/all?pageNumber=${page}`,
      );
      const { totalPage, playlists } = res.data;

      set(({
        playlists: playlists,
        currentPage: page,
        totalPages: totalPage,
        isPending: false,
        isLoadingMore: false,
      }));
    } catch {
      set({ isPending: false, isLoadingMore: false });
    }
  },
  setPlaylists: (payload) => {
    set({ playlists: payload });
  },
  addPlaylist: (payload) => {
    const { playlists } = get();
    set({ playlists: [payload, ...playlists] });
  },
  addMissingPlaylists: (payload) => {
    const { playlists } = get();
    const existingIds = new Set(playlists.map((p) => p._id));
    const newPlaylists = payload.filter((p) => !existingIds.has(p._id));
    if (newPlaylists.length > 0) {
      set({ playlists: [...playlists, ...newPlaylists] });
    }
  },
  updatePlaylist: (id, payload) => {
    const { playlists } = get();
    const updatedPlaylist = playlists.map((p: Playlist) => {
      if (p._id === id) {
        return payload;
      }
      return p;
    });
    set({ playlists: updatedPlaylist });
  },
  getPlaylist: (id) => {
    const { playlists } = get();
    const target = playlists.find((item: Playlist) => item._id === id);
    return target;
  },
  addTrack: (id, payload) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map((p) => {
      if (p._id === id) {
        return {
          ...p,
          tracks: [...p.tracks, payload],
        };
      }
      return p;
    });
    set({ playlists: updatedPlaylists });
  },
  removeTrack: (id, trackId) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map((p: Playlist) => {
      if (p._id === id) {
        return {
          ...p,
          tracks: p.tracks.filter((t: Track) => t._id != trackId),
        };
      }
      return p;
    });

    set({ playlists: updatedPlaylists });
  },
  trackExist: (id, trackId) => {
    const { playlists } = get();
    const target = playlists.find((item: Playlist) => item._id === id);
    const exist = target.tracks.some((track: Track) => track._id === trackId);
    return exist;
  },
  removeTrackAfterDelete: (trackId) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.map((p: Playlist) => {
      return {
        ...p,
        tracks: p.tracks.filter((t: Track) => t._id !== trackId),
      };
    });
    set({ playlists: updatedPlaylists });
  },
  removePlaylist: (id) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.filter((p: Playlist) => p._id !== id);
    set({ playlists: updatedPlaylists });
  },
}));
