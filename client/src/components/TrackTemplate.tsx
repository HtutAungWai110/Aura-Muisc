import { formatDuration, formatRelativeDate } from "@/lib/utils";
import { Play } from "lucide-react";
import { usePlaybackState } from "@/states/PlaybackState";
import TrackOptionsMenu from "./PlaylistMenu";
import { memo } from "react";

import type { Track } from "@/types/TrackType";

interface TrackTemplateProps {
  track: Track;
  index: number;
  allTracks?: Track[];
  playlistId?: string | null;
}

const TrackTemplate = ({
  track,
  index,
  allTracks,
  playlistId = null,
}: TrackTemplateProps) => {
  const { currentTrack, isPlaying, setCurrentTrack, setTracks, togglePlay } =
    usePlaybackState();
  const isCurrent = currentTrack?._id === track._id;

  const handlePlay = (e: React.MouseEvent) => {
    // If the click was on the options button or within the options menu, don't play
    if ((e.target as HTMLElement).closest(".options-container")) {
      return;
    }

    if (isCurrent) {
      togglePlay();
    } else {
      if (allTracks) {
        setTracks(allTracks);
      }
      setCurrentTrack(track);
    }
  };

  return (
    <div
      className={`grid grid-cols-[48px_1fr_1fr_100px_48px] gap-4 px-4 py-3 rounded-md hover:bg-white/5 group transition-colors cursor-pointer ${isCurrent ? "bg-primary/10" : ""}`}
      onClick={handlePlay}
    >
      <div className="flex items-center justify-center text-on-surface-variant group-hover:text-on-surface">
        {isCurrent && isPlaying ? (
          <div className="flex items-end gap-0.5 h-3">
            <div
              className="w-0.5 bg-primary animate-[bounce_1s_infinite]"
              style={{ height: "60%" }}
            ></div>
            <div
              className="w-0.5 bg-primary animate-[bounce_1.2s_infinite]"
              style={{ height: "100%" }}
            ></div>
            <div
              className="w-0.5 bg-primary animate-[bounce_0.8s_infinite]"
              style={{ height: "40%" }}
            ></div>
          </div>
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        <Play
          className={`size-4 hidden group-hover:block fill-current ${isCurrent ? "text-primary" : ""}`}
        />
      </div>

      <div className="flex items-center gap-3 min-w-0">
        {track.thumbnailUrl ? (
          <img
            src={`/api/${track.thumbnailUrl}`}
            alt={track.title}
            className="size-10 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="size-10 rounded bg-surface-variant flex items-center justify-center flex-shrink-0">
            🎵
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold truncate ${isCurrent ? "text-primary" : "text-on-surface"}`}
          >
            {track.title}
          </span>
          <span className="text-on-surface-variant text-sm truncate">
            {track.artist}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center text-on-surface-variant text-sm">
        {formatRelativeDate(track.addedAt)}
      </div>

      <div className="flex items-center justify-end text-on-surface-variant text-sm">
        {formatDuration(track.duration)}
      </div>

      <div className="flex items-center justify-center options-container">
        <TrackOptionsMenu track={track} playlistId={playlistId} />
      </div>
    </div>
  );
};

export default memo(TrackTemplate);
