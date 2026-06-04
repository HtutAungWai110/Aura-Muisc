import { usePlaylistStore } from "@/states/PlaylistState";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

interface PlaylistMenuProps {
  trackId: string;
  onClose: () => void;
}

export default function PlaylistMenu({ trackId, onClose }: PlaylistMenuProps) {
  const { fetchPlaylists, playlists } = usePlaylistStore();

  const addToPlaylistMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiClient.post(
        `/api/playlist/${id}/add/${trackId}`,
        {},
        { withCredentials: true },
      );

      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      onClose();
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
            onClick={(e) => {
              e.stopPropagation();
              addToPlaylistMutation.mutate(p._id);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-primary/20 flex items-center gap-2 transition-colors truncate"
          >
            <span className="material-symbols-outlined text-sm">
              library_music
            </span>
            <span className="truncate">{p.title}</span>
          </button>
        ))
      )}
    </div>
  );
}
