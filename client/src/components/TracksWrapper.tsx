import { Clock } from "lucide-react";

interface Track {
  _id: string;
  title: string;
  artist: string;
  addedAt: string;
  thumbnailUrl?: string;
  fileUrl: string;
  userId: string;
  __v: number;
  duration: number;
}

interface TracksWrapperProps {
  tracks: Track[];
}

export default function TracksWrapper({ tracks }: TracksWrapperProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full mt-8">
      {/* Header */}
      <div className="grid grid-cols-[48px_1fr_1fr_120px] gap-4 px-4 py-2 text-on-surface-variant font-label-caps text-label-caps border-b border-white/5">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Date Added</div>
        <div className="flex justify-end pr-4">
          <Clock className="size-4" />
        </div>
      </div>

      {/* Tracks List */}
      <div className="flex flex-col mt-2">
        {tracks.map((track, index) => (
          <div
            key={track._id}
            className="grid grid-cols-[48px_1fr_1fr_120px] gap-4 px-4 py-3 rounded-md hover:bg-white/5 group transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-center text-on-surface-variant group-hover:text-on-surface">
              {index + 1}
            </div>

            <div className="flex items-center gap-3 min-w-0">
              {track.thumbnailUrl ? (
                <img
                  src={`/api/${track.thumbnailUrl}`} // Assuming relative to root, adjust if base URL needed
                  alt={track.title}
                  className="size-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="size-10 rounded bg-surface-variant flex items-center justify-center flex-shrink-0">
                  🎵
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-on-surface font-bold truncate">
                  {track.title}
                </span>
                <span className="text-on-surface-variant text-sm truncate">
                  {track.artist}
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center text-on-surface-variant text-sm">
              {formatDate(track.addedAt)}
            </div>

            <div className="flex items-center justify-end text-on-surface-variant text-sm pr-4">
              {Math.floor(track.duration / 60) +
                ":" +
                Math.floor(track.duration % 60)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
