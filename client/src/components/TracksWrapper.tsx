import { Clock } from "lucide-react";
import TrackTemplate from "./TrackTemplate";
import type { Track } from "@/types/TrackType";
import { Button } from "./ui/button";
import { Play, Shuffle } from "lucide-react";
import { Mode } from "@/states/PlaybackState";
import { usePlaybackState } from "@/states/PlaybackState";
import { useEffect } from "react";

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

  const handlePlayAll = () => {
    if (tracks && tracks.length > 0) {
      setTracks(tracks);
      setCurrentTrack(tracks[0]);
    }
  };

  const handleShuffle = () => {
    setMode(mode === Mode.shuffle ? Mode.all : Mode.shuffle);
  };

  return (
    <div className="w-full mt-8">
      <div className="flex gap-2 my-8">
        <Button
          className="rounded-full bg-primary w-12 h-12 hover:bg-primary/90 text-on-primary-container font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all"
          variant="ghost"
          onClick={handlePlayAll}
        >
          <Play className="fill-current" />
        </Button>

        <Button
          className={`rounded-full w-12 h-12 font-bold text-lg hover:text-primary transition-all ${
            mode === Mode.shuffle ? "text-primary" : ""
          }`}
          variant="ghost"
          onClick={handleShuffle}
        >
          <Shuffle className="fill-current" />
        </Button>
      </div>
      {/* Header */}
      <div className="grid grid-cols-[48px_1fr_1fr_100px_48px] gap-4 px-4 py-2 text-on-surface-variant font-label-caps text-label-caps border-b border-white/5">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Date Added</div>
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
          />
        ))}
      </div>
    </div>
  );
}
