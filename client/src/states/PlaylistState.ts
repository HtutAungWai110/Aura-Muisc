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
  updatePlaylist: (id: string, payload: Track) => void;
  trackExist: (id: string, trackId: string) => boolean;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  isPending: true,
  error: null,
  fetchPlaylists: async () => {
    const res = await apiClient.get("/api/playlist/all", {
      withCredentials: true,
    });
    set({ playlists: res.data, isPending: false });
  },
  setPlaylists: (payload) => {
    set({ playlists: payload });
  },
  addPlaylist: (payload) => {
    const { playlists } = get();
    set({ playlists: [payload, ...playlists] });
  },
  getPlaylist: (id) => {
    const { playlists } = get();
    const target = playlists.find((item: Playlist) => item._id === id);
    return target;
  },
  updatePlaylist: (id, payload) => {
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
  trackExist: (id, trackId) => {
    const { playlists } = get();
    const target = playlists.find((item: Playlist) => item._id === id);
    const exist = target.tracks.some((track: Track) => track._id === trackId);
    return exist;
  },
}));
