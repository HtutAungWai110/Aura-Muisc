import { create } from "zustand";
import type { Playlist } from "@/types/PlaylistType";
import apiClient from "@/lib/apiClient";

interface PlaylistStore {
  playlists: Playlist[] | [];
  isPending: boolean;
  error: string | null;
  fetchPlaylists: () => void;
  setPlaylists: (payload: Playlist[]) => void;
  addPlaylist: (payload: Playlist) => void;
  getPlaylist: (id: string) => Playlist;
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
    set({ playlists: [...playlists, payload] });
  },
  getPlaylist: (id) => {
    const { playlists } = get();
    const target = playlists.find((item: Playlist) => item._id === id);
    return target;
  },
}));
