import { Clock, Trash2 } from "lucide-react";
import TrackTemplate from "./TrackTemplate";
import type { Track } from "@/types/TrackType";
import { Button } from "./ui/button";
import { Play, Shuffle } from "lucide-react";
import { Mode } from "@/states/PlaybackState";
import { usePlaybackState } from "@/states/PlaybackState";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";
import { useState } from "react";
import { Check } from "lucide-react";
import { usePlaylistStore } from "@/states/PlaylistState";

interface TracksWrapperProps {
  tracks: Track[];
  playlistId?: string;
}

export default function TracksWrapper({
  tracks,
  playlistId = null,
}: TracksWrapperProps) {
  const { mode, setMode, setTracks, setCurrentTrack, removeTrackById } =
    usePlaybackState();

  const [selectArray, setSelectArray] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const { removeTrackAfterDelete } = usePlaylistStore()

  useEffect(() => {
    console.log(selectArray)
  }, [selectArray])

  const handleSelectTrack = (trackId: string) => {
    if(selectArray.includes(trackId)) setSelectArray(prev => prev.filter(id => id !== trackId))
    else setSelectArray(prev => [...prev, trackId]);
  };

  useEffect(() => {
    if(selectArray.length === 0) setIsSelecting(false);
    else setIsSelecting(true);
  }, [selectArray])

  const isSelected = (trackId: string) => selectArray.includes(trackId);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (trackIds: string[]) => {
      const payload = { trackIds };
      if (playlistId) {
        await apiClient.post(`/api/playlist/remove/${playlistId}/tracks`, payload);
      } else {
        await apiClient.post(`/api/track/delete/batch`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Tracks"] });
      if (playlistId) {
        queryClient.invalidateQueries({ queryKey: [`Playlist ${playlistId}`] });
      }
      if (!playlistId) {
        selectArray.forEach(id => removeTrackById(id));
        selectArray.forEach(id => removeTrackAfterDelete(id))
      }
      setSelectArray([]);
      setIsSelecting(false);
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

  if(!tracks || tracks.length === 0) return null;

  return (
    <div className="w-full mt-8 mb-10 md:mb-20">
      {tracks && tracks.length > 0 && (
        <div className="flex gap-2 my-8">
          <Button
            className="rounded-full bg-on-surface w-12 h-12 hover:bg-on-surface/90 text-surface font-bold text-lg shadow-lg hover:shadow-on-surface/20 transition-all"
            variant="ghost"
            onClick={handlePlayAll}
          >
            <Play className="fill-current" />
          </Button>

          <Button
            className={`rounded-full w-12 h-12 font-bold text-lg text-black dark:text-white transition-all ${
              mode === Mode.shuffle ? "text-on-surface" : ""
            }`}
            variant="ghost"
            onClick={handleShuffle}
          >
            <Shuffle className="fill-current" />
          </Button>
        </div>
      )}

      {/*Select all and delete */}
      {isSelecting &&

        <div className="flex gap-2 my-8 justify-end">

          <Button
            className="flex items-center bg-red-500 text-white dark:bg-red-500 "
            onClick={() => deleteMutation.mutate(selectArray)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
            <Trash2 className="size-4" />
          </Button>
          <Button
            className="flex items-center dark:bg-white dark:text-black"
            onClick={() => setSelectArray(tracks.map(track => track._id))}
          >
            Select All
            <Check className={`border border-on-surface ${selectArray.length === tracks.length ? "bg-black dark:bg-white text-white dark:text-black" : ""}`}/>
          </Button>


        </div>
      }


      {/* Header */}
      <div className="hidden sm:grid grid-cols-5 gap-2 px-4 py-2 text-on-surface-variant font-label-caps text-[1em] border-b border-white/5">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div>Date Added</div>
        <div className="flex justify-end"><Clock className="size-4" /></div>
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
            onSelect={handleSelectTrack}
            isSelecting={isSelecting}
            selected={isSelected(track._id)}
          />
        ))}
      </div>
    </div>
  );
}
