import { Clock } from "lucide-react";
import TrackTemplate from "./TrackTemplate";
import type { Track } from "@/types/TrackType";
import { Button } from "./ui/button";
import { Play, Shuffle } from "lucide-react";
import { Mode } from "@/states/PlaybackState";
import { usePlaybackState } from "@/states/PlaybackState";
import { useEffect } from "react";
import { useSortStore } from "@/states/SortState";
import SortComboBox from "./SortComboBox";

interface TracksWrapperProps {
  tracks: Track[];
  playlistId?: string;
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
        <div className="flex gap-2 my-8 justify-between">
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
          <SortComboBox/>
        </div>
      )}

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
        {sort(tracks).map((track, index) => (
          <TrackTemplate
            key={track._id}
            track={track}
            index={index}
            allTracks={tracks}
            playlistId={playlistId}
          />
        ))}
      </div>
    </div>
  );
}
