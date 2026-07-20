import { usePlaylistStore } from "@/states/PlaylistState";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";
import { useErrorStore } from "@/states/ErrorState";
import { Check, Search } from "lucide-react";
import React, { useState } from "react";
import type { Playlist } from "@/types/PlaylistType";

interface PlaylistSubMenuProps {
  track: Track;
  onClose: () => void;
  position: "left" | "right";
}

export default function PlaylistSubMenu({
  track,
  onClose,
  position,
}: PlaylistSubMenuProps) {
  const { trackExist, addTrack, playlists, removeTrack } = usePlaylistStore();
  const [search, setSearch] = useState<string>("");
  const { setError } = useErrorStore();

  const addToPlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      addTrack(id, track);
      const res = await apiClient.post(
        `/api/playlist/${id}/add/${track._id}`,
        {},
      );
      return res.data;
    },
    onSuccess: () => {
      onClose();
    },
    onError: (error, id) => {
      setError(error.message);
      removeTrack(id, track._id);
    },
  });

  return (
    <div
      className={`absolute ${position === "left" ? "right-full" : "left-full"} sm:-top-10 -top-9 p-1  w-40 sm:w-48 max-h-64 bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-[60] overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full flex text-[0.7em] sm:text-[1em] gap-2 bg-on-surface/5 p-1 text-[0.8em] rounded-lg mb-1 sticky top-0 z-10 backdrop-blur-md">
        <Search className="w-4 h-4 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full outline-none bg-transparent"
          placeholder="Search playlist"
        />
      </div>
      {playlists.length === 0 ? (
        <div className="p-4 text-xs text-on-surface-variant italic text-center">
          No playlists found
        </div>
      ) : (
        playlists
          .filter((p: Playlist) =>
            p.title.toLowerCase().includes(search.toLowerCase().trim()),
          )
          .map((p) => (
            <button
              key={p._id}
              disabled={trackExist(p._id, track._id)}
              onClick={(e) => {
                e.stopPropagation();
                addToPlaylistMutation.mutate(p._id);
              }}
              className="w-full p-2 my-0.5 rounded-lg text-left hover:bg-on-surface/10 flex justify-between items-center gap-2 transition-colors truncate disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">
                  library_music
                </span>
                <span className="truncate">{p.title}</span>
              </div>
              {trackExist(p._id, track._id) && (
                <Check className="w-4 h-4 text-on-surface" />
              )}
            </button>
          ))
      )}
    </div>
  );
}
