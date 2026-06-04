import { formatDuration, formatRelativeDate } from "@/lib/utils";
import {
  ChevronRight,
  ListPlus,
  MoreVertical,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { usePlaybackState } from "@/states/PlaybackState";
import PlaylistMenu from "./PlaylistMenu";

import type { Track } from "@/types/TrackType";

interface TrackTemplateProps {
  track: Track;
  index: number;
  allTracks?: Track[];
}

export default function TrackTemplate({
  track,
  index,
  allTracks,
}: TrackTemplateProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const optionsRef = useRef<HTMLDivElement>(null);

  const { currentTrack, isPlaying, setCurrentTrack, setTracks, togglePlay } =
    usePlaybackState();
  const isCurrent = currentTrack?._id === track._id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      if (allTracks) {
        setTracks(allTracks);
      }
      setCurrentTrack(track);
    }
  };

  const delteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete(`/api/track/delete/${track._id}`, {
        withCredentials: true,
      });

      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["Tracks"] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
        setIsSubMenuOpen(false);
      }
    }

    if (isOptionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOptionsOpen]);

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

      <div
        className="flex items-center justify-center relative"
        ref={optionsRef}
        onMouseEnter={() => setIsOptionsOpen(true)}
        onMouseLeave={() => {
          setIsOptionsOpen(false);
          setIsSubMenuOpen(false);
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/10 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            setIsOptionsOpen(!isOptionsOpen);
          }}
        >
          <MoreVertical className="size-4" />
        </Button>

        {isOptionsOpen && (
          <div
            className="absolute right-0 top-0 mt-2 w-48 bg-surface-container-highest border border-white/10 rounded-lg shadow-2xl z-50 py-1"
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
                <PlaylistMenu
                  trackId={track._id}
                  onClose={() => {
                    setIsOptionsOpen(false);
                    setIsSubMenuOpen(false);
                  }}
                />
              )}
            </div>

            <button
              onClick={() => delteMutation.mutate()}
              className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 flex items-center gap-2 text-error transition-colors"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
