import { usePlaylistStore } from "@/states/PlaylistState";
import PlaylistCard from "./PlaylistCard";
import { Spinner } from "./ui/spinner";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import type { Playlist } from "@/types/PlaylistType";

export default function PlaylistsWrapper() {
  const {
    playlists,
    isPending,
    isLoadingMore,
    error,
    currentPage,
    totalPages,
    fetchPlaylists,
  } = usePlaylistStore();
  const location = useLocation();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isPlaylistsPage = location.pathname === "/playlists";

  const uniquePlaylists = useMemo(() => {
    const seen = new Set<string>();
    return playlists.filter((p: Playlist) => {
      if (seen.has(p._id)) return false;
      seen.add(p._id);
      return true;
    });
  }, [playlists]);

  useEffect(() => {
    if (!isPlaylistsPage) return;
    if (currentPage >= totalPages) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          fetchPlaylists(currentPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isPlaylistsPage, currentPage, totalPages, isLoadingMore, fetchPlaylists]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner className="size-8 text-on-surface" />
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

  if (!uniquePlaylists || uniquePlaylists.length === 0) {
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
    <div className="w-full mt-10 md:mb-20 mb-30">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Your Playlists</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {uniquePlaylists.map((playlist, index) => {
          if (index + 1 > 5 && !isPlaylistsPage) return null;
          return <PlaylistCard key={playlist._id} playlist={playlist} />;
        })}
      </div>

      {isPlaylistsPage && currentPage < totalPages && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isLoadingMore && <Spinner className="size-6 text-on-surface" />}
        </div>
      )}

      {uniquePlaylists.length > 5 && !isPlaylistsPage && (
        <div className="flex justify-end items-center mt-5">
          <Link to="/playlists" className="text-on-surface-variant text-sm">
            View all playlists
          </Link>
        </div>
      )}
    </div>
  );
}
