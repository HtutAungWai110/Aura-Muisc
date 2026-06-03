import { useEffect, useRef, useState } from "react";
import { usePlaybackState } from "@/states/PlaybackState";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Slider } from "./ui/slider"; // Assuming there is a slider in ui/
import { Button } from "./ui/button";
import { formatDuration } from "@/lib/utils";

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    setIsPlaying,
    queueIndex,
    nextTrack,
    prevTrack,
    volume,
    setVolume,
  } = usePlaybackState();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-surface-container/80 backdrop-blur-xl border-t border-white/5 z-[100] px-8 flex items-center justify-between">
      <audio
        ref={audioRef}
        src={`/api/${currentTrack.fileUrl}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        {currentTrack.thumbnailUrl ? (
          <img
            src={`/api/${currentTrack.thumbnailUrl}`}
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
            onClick={prevTrack}
            className="hover:text-primary transition-colors"
          >
            <SkipBack className="size-6 fill-current" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="size-10 rounded-full bg-primary text-on-primary hover:scale-105 transition-transform"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="size-6 fill-current" />
            ) : (
              <Play className="size-6 fill-current translate-x-0.5" />
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
    </div>
  );
}
