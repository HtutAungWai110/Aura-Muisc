import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/states/PlaylistState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import TracksWrapper from "@/components/TracksWrapper";
import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Playlist } from "@/types/PlaylistType";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import PlaylistOptionsBox from "@/components/PlaylistOptionsBox";
import CoverPhotoDisplay from "@/components/CoverPhotoDisplay";
import PlaylistEditPanel from "@/components/PlaylistEditPanel";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { getPlaylist } = usePlaylistStore();
  const initialData = getPlaylist(id);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData && id) {
      queryClient.setQueryData([`Playlist ${id}`], initialData);
    }
  }, [initialData, id, queryClient]);

  const {
    data: playlistData,
    isLoading,
    isError,
  } = useQuery<Playlist>({
    queryKey: [`Playlist ${id}`],
    queryFn: async () => {
      const res = await apiClient.get(`/api/playlist/${id}`, {
        withCredentials: true,
      });

      return res.data;
    },
    retry: false,
    refetchOnMount: true,
    initialData: initialData,
  });

  const handleOpenMenu = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const onEdit = (): void => {
    setIsEditing(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (isLoading && !playlistData) {
    return (
      <div className="ml-80 min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (isError || !playlistData) {
    return (
      <div className="ml-80 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-on-surface mb-2">Oops!</h2>
          <p className="text-on-surface-variant">
            Could not load the playlist.
          </p>
        </div>
      </div>
    );
  }

  const totalDuration = playlistData.tracks.reduce(
    (acc, track) => acc + track.duration,
    0,
  );

  return (
    <div className="ml-80 min-h-screen flex flex-col overflow-hidden bg-background">
      {isEditing && (
        <PlaylistEditPanel
          onClose={() => setIsEditing(false)}
          playlist={playlistData}
        />
      )}
      <div className="p-container-padding-desktop pt-12">
        {/* Playlist Hero */}
        <div className="flex flex-col md:flex-row items-end gap-8 mb-10">
          <CoverPhotoDisplay
            isOnEditMode={false}
            coverPhotoUrl={playlistData.coverPhotoUrl}
            playlistId={playlistData._id}
          />
          <div className="flex flex-col gap-2 pb-2">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.2em] mb-1">
              Playlist
            </span>
            <h1 className="font-headline-xl text-headline-xl text-on-surface leading-none mb-6 tracking-tight">
              {playlistData.title}
            </h1>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm bg-white/5 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
              <span className="font-bold text-primary">You</span>
              <span className="opacity-40">•</span>
              <span>{playlistData.tracks.length} tracks</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatDuration(totalDuration)}
              </span>
            </div>
            <div className="relative mt-4">
              <button
                onClick={handleOpenMenu}
                className="rounded-full p-1 text-neutral hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-primary"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              <PlaylistOptionsBox
                playlist={playlistData}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                onEdit={onEdit}
              />
            </div>
          </div>
        </div>

        {/* Tracks List */}
        {playlistData.tracks.length > 0 ? (
          <div className="bg-surface-container/30 backdrop-blur-md rounded-2xl border border-white/5 p-2 mb-12">
            <TracksWrapper tracks={playlistData.tracks} playlistId={id} />
          </div>
        ) : (
          <div className="bg-primary/10 w-full h-50 rounded-2xl flex justify-center items-center opacity-60">
            <h1>No tracks in the playlist yet!</h1>
          </div>
        )}
      </div>
    </div>
  );
}
