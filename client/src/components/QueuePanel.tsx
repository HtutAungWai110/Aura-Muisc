import { usePlaybackState } from "@/states/PlaybackState";
import { X, ListMusic } from "lucide-react";
import { Button } from "./ui/button";
import { formatDuration } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface QueuePanelProps {
  onClose: () => void;
}

export default function QueuePanel({ onClose }: QueuePanelProps) {
  const { queue, queueIndex, currentTrack, setCurrentTrack } = usePlaybackState();
  const panelRef = useRef<HTMLDivElement>(null);

  // Upcoming tracks are those after the current index in the queue
  const upcomingTracks = queue.slice(queueIndex + 1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click target is outside the panel
      // Also ensure we don't close it if clicking the queue button itself, 
      // but since the queue button handles toggle itself, stopping event propagation 
      // or letting it check if the click hits the panel is standard.
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // To prevent immediate closing if the click was on the toggle button itself (which triggers AudioPlayer state),
        // we can check if the click was on a button that toggles queue, or just let it close.
        // Let's add a small check to see if the element or its parent has a specific attribute or if we can ignore clicks that happen right as it opens.
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={panelRef}
      className="fixed right-8 bottom-28 w-80 max-h-[70vh] bg-surface-container/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[110] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="size-5 text-primary" />
          <h3 className="font-bold text-on-surface">Queue</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 size-8">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-minimal">
        {/* Now Playing */}
        <section>
          <p className="text-[10px] font-label-caps text-on-surface-variant px-2 mb-2 uppercase tracking-wider opacity-70">Now Playing</p>
          {currentTrack ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
              {currentTrack.thumbnailUrl ? (
                <img src={`/api/${currentTrack.thumbnailUrl}`} className="size-10 rounded object-cover shadow-sm" alt="" />
              ) : (
                <div className="size-10 rounded bg-surface-variant flex items-center justify-center text-lg">🎵</div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-primary truncate">{currentTrack.title}</span>
                <span className="text-xs text-on-surface-variant truncate">{currentTrack.artist}</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">
                {formatDuration(currentTrack.duration)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant px-2 italic">Nothing playing</p>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <p className="text-[10px] font-label-caps text-on-surface-variant px-2 mb-2 uppercase tracking-wider opacity-70">Upcoming</p>
          <div className="space-y-1">
            {upcomingTracks.length > 0 ? (
              upcomingTracks.map((track, idx) => (
                <button
                  key={`${track._id}-${idx}`}
                  onClick={() => setCurrentTrack(track)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
                >
                  {track.thumbnailUrl ? (
                    <img src={`/api/${track.thumbnailUrl}`} className="size-10 rounded object-cover" alt="" />
                  ) : (
                    <div className="size-10 rounded bg-surface-variant flex items-center justify-center">🎵</div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </span>
                    <span className="text-xs text-on-surface-variant truncate">{track.artist}</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {formatDuration(track.duration)}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant px-2 italic">No upcoming tracks</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
