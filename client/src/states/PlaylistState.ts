import { create } from "zustand";
import type { Playlist } from "@/types/PlaylistType";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";

interface PlaylistStore {
  playlists: Playlist[] | [];
  isPending: boolean;
  error: string | null;
  fetchPlaylists: () => void;
  setPlaylists: (payload: Playlist[]) => void;
  addPlaylist: (payload: Playlist) => void;
  getPlaylist: (id: string) => Playlist;
  updatePlaylist: (id: string, payload: Playlist) => void;
  addTrack: (id: string, payload: Track) => void;
  removeTrack: (id: string, trackId: string) => void;
  trackExist: (id: string, trackId: string) => boolean;
  removeTrackAfterDelete: (trackId: string) => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  isPending: true,
  error: null,
  fetchPlaylists: async () => {
    try {
      const res = await apiClient.get("/api/playlist/all", {
        withCredentials: true,
      });
      set({ playlists: res.data, isPending: false });
    } catch (_) {
      set({ isPending: false });
    }
  },
  setPlaylists: (payload) => {
    set({ playlists: payload });
  },
  addPlaylist: (payload) => {
    const { playlists } = get();
    set({ playlists: [payload, ...playlists] });
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
}));
