import { useEffect, useRef, useState } from "react";
import { usePlaybackState, Mode } from "@/states/PlaybackState";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  ListMusic,
} from "lucide-react";
import { Slider } from "./ui/slider"; // Assuming there is a slider in ui/
import { Button } from "./ui/button";
import { formatDuration } from "@/lib/utils";
import { useCallback } from "react";
import QueuePanel from "./QueuePanel";

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    setIsPlaying,
    nextTrack,
    prevTrack,
    volume,
    setVolume,
    mode,
    setMode,
    setLooping,
    isLooping,
  } = usePlaybackState();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.error("Playback failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (audioRef.current) {
        if (e.ctrlKey && e.key === "ArrowRight") {
          nextTrack();
        }
        if (e.ctrlKey && e.key === "ArrowLeft") {
          prevTrack();
        }
        if (e.key === " ") {
          togglePlay();
        }

        // New shortcuts
        if (e.shiftKey && e.key === "ArrowRight") {
          e.preventDefault();
          if (audioRef.current) {
            const newTime = Math.min(
              audioRef.current.currentTime + 5,
              audioRef.current.duration,
            );
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }
        }
        if (e.shiftKey && e.key === "ArrowLeft") {
          e.preventDefault();
          if (audioRef.current) {
            const newTime = Math.max(audioRef.current.currentTime - 5, 0);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const newVolume = Math.min(volume + 0.1, 1);
          setVolume(newVolume);
          if (newVolume > 0) setIsMuted(false);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const newVolume = Math.max(volume - 0.1, 0);
          setVolume(newVolume);
          if (newVolume === 0) setIsMuted(true);
        }
      }
    },
    [
      nextTrack,
      prevTrack,
      togglePlay,
      volume,
      setVolume,
      setIsMuted,
      setCurrentTime,
    ],
  );

  useEffect(() => {
    if (isPlaying || audioRef.current)
      document.addEventListener("keydown", handleShortcut);

    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, [handleShortcut, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [audioRef]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [audioRef]);

  const handleProgressChange = useCallback(
    (value: number[]) => {
      if (audioRef.current) {
        audioRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
      }
    },
    [audioRef],
  );

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      setVolume(value[0]);
      if (value[0] > 0) setIsMuted(false);
    },
    [setVolume, setIsMuted],
  );

  const toggleLoop = useCallback(() => {
    setLooping();
  }, [setLooping]);

  const toggleShuffle = useCallback(() => {
    setMode(mode === Mode.shuffle ? Mode.all : Mode.shuffle);
  }, [setMode, mode]);

  const playNext = useCallback(() => {
    if (isLooping) {
      setIsPlaying(true);
    } else {
      nextTrack();
    }
  }, [isLooping, setIsPlaying, nextTrack]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-surface-container/80 backdrop-blur-xl border-t border-white/5 z-[100] px-8 flex items-center justify-between">
      <audio
        ref={audioRef}
        src={`${currentTrack.fileUrl}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        {currentTrack.thumbnailUrl ? (
          <img
            src={`${currentTrack.thumbnailUrl}`}
            alt={currentTrack.title}
            className="size-14 rounded-md object-cover shadow-lg"
          />
        ) : (
          <div className="size-14 rounded-md bg-surface-variant flex items-center justify-center text-2xl shadow-lg">
            🎵
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-on-surface font-bold truncate">
            {currentTrack.title}
          </span>
          <span className="text-on-surface-variant text-sm truncate">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={`transition-colors ${
              mode === Mode.shuffle ? "text-primary" : "hover:text-primary"
            }`}
          >
            <Shuffle className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevTrack}
            className="hover:text-primary transition-colors"
          >
            <SkipBack className="size-6 fill-current" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full bg-white hover:scale-105 transition-transform"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="size-6 text-black/80 fill-black/80" />
            ) : (
              <Play className="size-6 text-black/80 fill-black/80" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextTrack}
            className="hover:text-primary transition-colors"
          >
            <SkipForward className="size-6 fill-current" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLoop}
            className={`transition-colors ${
              isLooping ? "text-primary" : "hover:text-primary"
            }`}
          >
            <Repeat className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] text-on-surface-variant w-10 text-right font-mono">
            {formatDuration(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="flex-1"
          />
          <span className="text-[10px] text-on-surface-variant w-10 font-mono">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-3 w-1/3">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsQueueOpen(!isQueueOpen);
          }}
          className={`transition-colors ${
            isQueueOpen
              ? "text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <ListMusic className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="text-on-surface-variant"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="size-5" />
          ) : (
            <Volume2 className="size-5" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-24"
        />
      </div>

      {isQueueOpen && <QueuePanel onClose={() => setIsQueueOpen(false)} />}
    </div>
  );
}
