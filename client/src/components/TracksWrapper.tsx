import { Clock } from "lucide-react";
import TrackTemplate from "./TrackTemplate";
import type { Track } from "./TrackTemplate";

interface TracksWrapperProps {
  tracks: Track[];
}

export default function TracksWrapper({ tracks }: TracksWrapperProps) {
  return (
    <div className="w-full mt-8">
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
          />
        ))}
      </div>
    </div>
  );
}
