import { usePlaylistStore } from "@/states/PlaylistState";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";
import { useErrorStore } from "@/states/ErrorState";
import {
  Check,
  Search,
  MoreVertical,
  Pencil,
  ListPlus,
  ChevronRight,
  Trash2,
} from "lucide-react";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Button } from "./ui/button";
import type { Playlist } from "@/types/PlaylistType";

interface PlaylistSubMenuProps {
  track: Track;
  onClose: () => void;
  position: "left" | "right";
}

function PlaylistSubMenu({ track, onClose, position }: PlaylistSubMenuProps) {
  const { trackExist, addTrack, playlists, removeTrack } = usePlaylistStore();
  const [search, setSearch] = useState<string>("");
  const { setError } = useErrorStore();

  const addToPlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      addTrack(id, track);
      const res = await apiClient.post(
        `/api/playlist/${id}/add/${track._id}`,
        {},
      );
      return res.data;
    },
    onSuccess: () => {
      onClose();
    },
    onError: (error, id) => {
      setError(error.message);
      removeTrack(id, track._id);
    },
  });

  return (
    <div
      className={`absolute ${position === "left" ? "right-full" : "left-full"} -top-10 p-1 w-48 max-h-64 bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-[60] overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full flex gap-2 bg-primary/10 p-1 text-[0.8em] rounded-lg mb-1 sticky top-0 z-10 backdrop-blur-md">
        <Search className="w-4 h-4 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full outline-none bg-transparent"
          placeholder="Search playlist"
        />
      </div>
      {playlists.length === 0 ? (
        <div className="p-4 text-xs text-on-surface-variant italic text-center">
          No playlists found
        </div>
      ) : (
        playlists
          .filter((p: Playlist) =>
            p.title.toLowerCase().includes(search.toLowerCase().trim()),
          )
          .map((p) => (
            <button
              key={p._id}
              disabled={trackExist(p._id, track._id)}
              onClick={(e) => {
                e.stopPropagation();
                addToPlaylistMutation.mutate(p._id);
              }}
              className="w-full p-2 my-0.5 rounded-lg text-left text-sm hover:bg-primary/20 flex justify-between items-center gap-2 transition-colors truncate disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  library_music
                </span>
                <span className="truncate">{p.title}</span>
              </div>
              {trackExist(p._id, track._id) && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </button>
          ))
      )}
    </div>
  );
}

interface TrackOptionsMenuProps {
  track: Track;
  playlistId?: string | null;
}

export default function TrackOptionsMenu({
  track,
  playlistId = null,
}: TrackOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const [subMenuVerticalOffset, setSubMenuVerticalOffset] = useState(0);
  const { removeTrackAfterDelete } = usePlaylistStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { removeTrack } = usePlaylistStore();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const url = playlistId
        ? `/api/playlist/remove/${playlistId}/track/${track._id}`
        : `/api/track/delete/${track._id}`;
      const res = await apiClient.delete(url);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Tracks"] });
      removeTrackAfterDelete(track._id);
      if (playlistId) {
        queryClient.invalidateQueries({ queryKey: [`Playlist ${playlistId}`] });
        removeTrack(playlistId, track._id);
      }
      setIsOpen(false);
    },
  });

  useLayoutEffect(() => {
    if (isOpen && menuRef.current && containerRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const audioPlayerHeight = 96; // 24rem * 4 = 96px as defined in AudioPlayer.tsx (h-24)

      // Calculate space below
      const spaceBelow =
        viewportHeight - containerRect.bottom - audioPlayerHeight;
      const spaceAbove = containerRect.top;

      if (spaceBelow < menuRect.height && spaceAbove > menuRect.height) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsSubMenuOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className="relative flex items-center justify-center"
      ref={containerRef}
    >
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-white/10 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MoreVertical className="size-4" />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute right-0 w-48 bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-50 py-1 ${
            menuPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 transition-colors">
            <Pencil className="size-3.5" />
            Edit
          </button>

          <div
            className="relative"
            onMouseEnter={() => setIsSubMenuOpen(true)}
            onMouseLeave={() => setIsSubMenuOpen(false)}
          >
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2">
                <ListPlus className="size-3.5" />
                Add to playlist
              </div>
              <ChevronRight className="size-3.5" />
            </button>

            {isSubMenuOpen && (
              <PlaylistSubMenu
                track={track}
                onClose={() => {
                  setIsOpen(false);
                  setIsSubMenuOpen(false);
                }}
                position="left"
                verticalOffset={subMenuVerticalOffset}
              />
            )}
          </div>

          <button
            onClick={() => deleteMutation.mutate()}
            className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-error transition-colors"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
