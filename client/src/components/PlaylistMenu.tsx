import { usePlaylistStore } from "@/states/PlaylistState";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";
import { Check, Search } from "lucide-react";
import React, { useState, type ChangeEvent } from "react";

interface PlaylistMenuProps {
  track: Track;
  onClose: () => void;
}

export default function PlaylistMenu({ track, onClose }: PlaylistMenuProps) {
  const { trackExist, addTrack, playlists, removeTrack } = usePlaylistStore();
  const [search, setSearch] = useState<string>("");

  const addToPlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      addTrack(id, track);
      console.log(playlists);
      const res = await apiClient.post(
        `/api/playlist/${id}/add/${track._id}`,
        {},
        { withCredentials: true },
      );

      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      onClose();
    },
    onError: (error, id) => {
      removeTrack(id, track._id);
    },
  });

  return (
    <div className="absolute right-full top-[-105%] p-1 w-48 max-h-fit min-h-[100px] bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-[60] max-h-64 overflow-y-auto">
      <div className="w-full flex gap-2 bg-primary/10 p-1 text-[0.8em] rounded-lg">
        <Search className="w-5" />
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full outline-none"
          placeholder="Search playlist"
        />
      </div>
      {playlists.length === 0 ? (
        <div className="p-4 text-xs text-on-surface-variant italic text-center">
          No playlists found
        </div>
      ) : (
        [...playlists]
          .filter((p) => {
            if (search.trim() != "") {
              return p.title
                .split(" ")
                .join("")
                .includes(search.split(" ").join(""));
            }
            return p;
          })
          .map((p) => (
            <button
              key={p._id}
              disabled={trackExist(p._id, track._id)}
              onClick={(e) => {
                e.stopPropagation();
                addToPlaylistMutation.mutate(p._id);
              }}
              className="w-full p-2 my-1 rounded-lg text-left text-sm hover:bg-primary/20 flex justify-between items-center gap-2 transition-colors truncate"
            >
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm">
                  library_music
                </span>

                <span className="truncate">{p.title}</span>
              </div>
              {trackExist(p._id, track._id) && (
                <Check className="fill-green-500 p-1 rounded-2xl bg-green-500 opacity-90" />
              )}
            </button>
          ))
      )}
    </div>
  );
}
