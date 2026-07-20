import type { TrackPreview } from "@/states/TrackImportsState";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { Button } from "./ui/button";
import { X } from "lucide-react";
export default function TrackPreviewCard({ track }: { track: TrackPreview }) {
  const { removeTrack } = useTrackImportsState();
  const { id, title, artist, thumbnailUrl } = track;

  return (
    <div
      key={id}
      className="flex flex-col gap-4 p-2 shadow-none w-30 rounded-2xl bg-on-surface/5 relative"
    >
      <Button
        className="absolute right-0"
        variant="ghost"
        onClick={() => removeTrack(track.id)}
      >
        <X />
      </Button>
      {/* Thumbnail Render */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex w-full h-25 shrink-0 items-center justify-center rounded-md bg-surface-variant text-2xl">
          🎵
        </div>
      )}

      {/* Info and Mini Audio Player */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-on-surface">{title}</p>
        <p className="text-sm text-on-surface-variant">{artist}</p>
      </div>
    </div>
  );
}
