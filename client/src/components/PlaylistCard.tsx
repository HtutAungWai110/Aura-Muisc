import { Play } from "lucide-react";
import type { Playlist } from "@/types/PlaylistType";
import { Link } from "react-router-dom";

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {


  return (
    <Link to={`/playlist/${playlist._id}`} className="sm:w-50 w-40">
      <div className="group relative flex flex-col gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer">
        <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
          {playlist.coverPhotoUrl ? (
            <img
              src={`${playlist.coverPhotoUrl}`}
              alt={playlist.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-6xl">
                library_music
              </span>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="size-12 rounded-full bg-on-surface flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Play className="size-6 text-surface fill-current" />
            </div>
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-on-surface truncate group-hover:text-on-surface transition-colors">
            {playlist.title}
          </h3>
          <p className="text-on-surface-variant text-sm font-label-caps opacity-70">
            {playlist.trackCount} {playlist.trackCount === 1 ? "Track" : "Tracks"}
          </p>
        </div>
      </div>
    </Link>
  );
}
