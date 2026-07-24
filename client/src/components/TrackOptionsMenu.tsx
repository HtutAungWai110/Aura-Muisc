import { usePlaylistStore } from "@/states/PlaylistState";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Track } from "@/types/TrackType";
import {
  MoreVertical,
  Pencil,
  ListPlus,
  ChevronRight,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Button } from "./ui/button";
import PlaylistSubMenu from "./PlaylistSubMenu";
import { Spinner } from "./ui/spinner";
import { useTracksCountStore } from "@/states/TrackCountState";

interface TrackOptionsMenuProps {
  track: Track;
  playlistId?: string | null;
  onEnterSelecting?: () => void;
}

export default function TrackOptionsMenu({
  track,
  playlistId = null,
  onEnterSelecting,
}: TrackOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const [subMenuVerticalOffset, setSubMenuVerticalOffset] = useState(0);
  const { removeTrackAfterDelete, removeTrack } = usePlaylistStore();
  const {setTracksCount} = useTracksCountStore()

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
      // setTracksCount(-1);
      if (playlistId) {
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
      const audioPlayerHeight = 96;

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
      className="relative flex items-center justify-center "
      ref={containerRef}
    >
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-white/10 rounded-full text-black dark:text-white"
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
          className={`absolute right-0 w-40 sm:w-48 text-[0.7em] sm:text-sm bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-50 py-1 ${
            menuPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 transition-colors"
            onClick={() => {
              setIsOpen(false);
              onEnterSelecting?.();
            }}
          >
            <CheckCircle className="size-3.5" />
            Select
          </button>

          <div
            className="relative"
            onMouseEnter={() => setIsSubMenuOpen(true)}
            onMouseLeave={() => setIsSubMenuOpen(false)}
            onClick={() => setIsSubMenuOpen(true)}
          >
            <button className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center justify-between transition-colors">
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
            disabled={deleteMutation.isPending}
            className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-error transition-colors"
          >
            <Trash2 className="size-3.5" />
            {playlistId ? "Remove" : "Delete"}
            {deleteMutation.isPending && <Spinner className="size-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
