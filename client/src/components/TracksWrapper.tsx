import { Clock } from "lucide-react";
import TrackTemplate from "./TrackTemplate";
import type { Track } from "@/types/TrackType";
import { Button } from "./ui/button";
import { Play, Shuffle, Trash2, CheckSquare, X } from "lucide-react";
import { Mode } from "@/states/PlaybackState";
import { usePlaybackState } from "@/states/PlaybackState";
import { useEffect } from "react";
import { useSortStore } from "@/states/SortState";
import SortSelectBox from "./SortSelectBox";
import { useTrackSelection } from "@/hooks/useTrackSelection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Spinner } from "./ui/spinner";
import { usePlaylistStore } from "@/states/PlaylistState";

interface TracksWrapperProps {
  tracks: Track[];
  playlistId?: string | null;
}

export default function TracksWrapper({
  tracks,
  playlistId = null,
}: TracksWrapperProps) {
  const { mode, setMode, setTracks, setCurrentTrack, queue, queueIndex } =
    usePlaybackState();
  useEffect(() => {
    console.log(queue, queueIndex);
  }, [queue, queueIndex]);

  const { sort } = useSortStore();
  const queryClient = useQueryClient();
  const { removeTrackAfterDelete } = usePlaylistStore();

  const {
    selectedIds,
    isSelecting,
    toggleSelect,
    selectAll,
    enterSelecting,
    exitSelecting,
  } = useTrackSelection();

  const batchDeleteMutation = useMutation({
    mutationFn: async () => {
      if (playlistId) {
        const res = await apiClient.delete(
          `/api/playlist/remove-batch/${playlistId}`,
          { data: { trackIds: selectedIds } },
        );
        return res.data;
      } else {
        const res = await apiClient.delete(`/api/track/delete-batch`, {
          data: { ids: selectedIds },
        });
        return res.data;
      }
    },
    onSuccess: () => {
      if (playlistId) {
        queryClient.invalidateQueries({
          queryKey: [`Playlist ${playlistId}`],
        });
      } else {
        selectedIds.forEach((id) => removeTrackAfterDelete(id));
      }
      queryClient.invalidateQueries({ queryKey: ["Tracks"] });
      exitSelecting();
    },
  });

  const handlePlayAll = () => {
    if (tracks && tracks.length > 0) {
      setTracks(tracks);
      setCurrentTrack(tracks[0]);
    }
  };

  const handleShuffle = () => {
    setMode(mode === Mode.shuffle ? Mode.all : Mode.shuffle);
  };

  const handleSelectAll = () => {
    selectAll(tracks.map((t) => t._id));
  };

  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="w-full mt-8 mb-10 md:mb-20">
      {tracks && tracks.length > 0 && (
        <div className="flex gap-2 my-8 justify-between">
          {isSelecting ? (
            <div className="flex gap-2 items-center">
              <Button
                className="rounded-full bg-error hover:bg-error/90 text-on-error font-bold text-sm shadow-lg transition-all gap-2"
                variant="ghost"
                onClick={() => batchDeleteMutation.mutate()}
                disabled={
                  selectedIds.length === 0 || batchDeleteMutation.isPending
                }
              >
                {batchDeleteMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {playlistId ? "Remove" : "Delete"} ({selectedIds.length})
              </Button>

              <Button
                className="rounded-full font-bold text-sm transition-all gap-2"
                variant="ghost"
                onClick={handleSelectAll}
              >
                <CheckSquare className="size-4" />
                Select All
              </Button>

              <Button
                className="rounded-full w-10 h-10 transition-all"
                variant="ghost"
                onClick={exitSelecting}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <Button
                className="rounded-full bg-on-surface w-12 h-12 hover:bg-on-surface/90 text-surface font-bold text-lg shadow-lg hover:shadow-on-surface/20 transition-all"
                variant="ghost"
                onClick={handlePlayAll}
              >
                <Play className="fill-current" />
              </Button>

              <Button
                className={`rounded-full w-12 h-12 font-bold text-lg hover:text-on-surface transition-all ${
                  mode === Mode.shuffle ? "text-on-surface" : ""
                }`}
                variant="ghost"
                onClick={handleShuffle}
              >
                <Shuffle className="fill-current" />
              </Button>
            </div>
          )}
          {!isSelecting && <SortSelectBox />}
        </div>
      )}

      {/* Header */}
      <div className="hidden sm:grid grid-cols-5 gap-2 px-4 py-2 text-on-surface-variant font-label-caps text-[1em] border-b border-white/5">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div>Date Added</div>
        <div className="flex justify-end">
          <Clock className="size-4" />
        </div>
        <div></div>
      </div>

      {/* Tracks List */}
      <div className="flex flex-col mt-2">
        {tracks.map((track, index) => (
          <TrackTemplate
            key={track._id}
            track={track}
            index={index}
            allTracks={tracks}
            playlistId={playlistId}
            isSelecting={isSelecting}
            isSelected={selectedIds.includes(track._id)}
            onToggleSelect={toggleSelect}
            onEnterSelecting={enterSelecting}
          />
        ))}
      </div>
    </div>
  );
}
