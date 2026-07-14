import { usePlaylistStore } from "@/states/PlaylistState";
import PlaylistCard from "./PlaylistCard";
import { Spinner } from "./ui/spinner";

export default function PlaylistsWrapper() {
  const { playlists, isPending, error } = usePlaylistStore();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-on-surface-variant font-label-caps animate-pulse">
          Loading Playlists...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-error">
        <span className="material-symbols-outlined text-4xl mb-2">error</span>
        <p>Failed to load playlists</p>
      </div>
    );
  }

  if (!playlists || playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 mt-5">
        <span className="material-symbols-outlined text-on-surface-variant/40 text-6xl mb-4">
          playlist_add
        </span>
        <h3 className="text-xl font-bold text-on-surface mb-1">
          No playlists yet
        </h3>
        <p className="text-on-surface-variant text-sm">
          Create your first playlist to get started
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Your Playlists</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist._id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}
