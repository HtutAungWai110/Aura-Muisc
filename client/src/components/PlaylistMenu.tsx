import { usePlaylistStore } from "@/states/PlaylistState";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";
import { Check } from "lucide-react";

interface PlaylistMenuProps {
  track: Track;
  onClose: () => void;
}

export default function PlaylistMenu({ track, onClose }: PlaylistMenuProps) {
  const { trackExist, updatePlaylist, playlists, removeTrack } =
    usePlaylistStore();

  const addToPlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      updatePlaylist(id, track);
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
    <div className="absolute right-full top-[-105%]  w-48 bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-[60] max-h-64 overflow-y-auto">
      {playlists.length === 0 ? (
        <div className="px-4 py-2 text-xs text-on-surface-variant italic text-center">
          No playlists found
        </div>
      ) : (
        playlists.map((p) => (
          <button
            key={p._id}
            disabled={trackExist(p._id, track._id)}
            onClick={(e) => {
              e.stopPropagation();
              addToPlaylistMutation.mutate(p._id);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 flex justify-between items-center gap-2 transition-colors truncate"
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
