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
  ChevronDown,
} from "lucide-react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { formatDuration } from "@/lib/utils";
import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isFullScreen]);
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
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput) return;

      if (audioRef.current) {
        if (e.ctrlKey && e.key === "ArrowRight") {
          e.preventDefault();
          nextTrack();
        }
        if (e.ctrlKey && e.key === "ArrowLeft") {
          e.preventDefault();
          prevTrack();
        }
        if (e.key === " ") {
          e.preventDefault();
          togglePlay();
        }

        if (e.shiftKey && e.key === "ArrowRight") {
          e.preventDefault();
          const newTime = Math.min(
            audioRef.current.currentTime + 5,
            audioRef.current.duration,
          );
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
        if (e.shiftKey && e.key === "ArrowLeft") {
          e.preventDefault();
          const newTime = Math.max(audioRef.current.currentTime - 5, 0);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
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
    [setVolume],
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
    <>
      <div className="fixed left-0 right-0 bottom-[84px] md:bottom-0 z-[100]">
        <audio
          ref={audioRef}
          src={`${currentTrack.fileUrl}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

      {/* Pill (mobile) / Full bar (desktop) */}
      <div
        className={`mx-3 md:mx-0 rounded-full md:rounded-none bg-white/10 md:bg-surface-container/80 backdrop-blur-2xl md:backdrop-blur-xl border border-white/10 md:border-t md:border-white/5 shadow-2xl md:shadow-none h-12 md:h-24 px-5 md:px-8  flex items-center justify-between cursor-pointer md:cursor-default ${isFullScreen ? "md:flex hidden" : ""}`}
        onClick={() => setIsFullScreen(true)}
      >
        {/* Track Info */}
        <div className="flex items-center gap-2 md:gap-4 w-1/3 min-w-0">
          {currentTrack.thumbnailUrl ? (
            <img
              src={`${currentTrack.thumbnailUrl}`}
              alt={currentTrack.title}
              className="size-8 md:size-14 rounded-md object-cover shadow-lg shrink-0"
            />
          ) : (
            <div className="size-8 md:size-14 rounded-md bg-surface-variant flex items-center justify-center text-lg md:text-2xl shadow-lg shrink-0">
              🎵
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-on-surface font-bold truncate text-xs md:text-base">
              {currentTrack.title}
            </span>
            <span className="text-on-surface-variant text-[10px] md:text-sm truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-0 md:gap-2 w-1/3">
          <div className="flex items-center gap-1 md:gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
              className={`transition-colors hidden md:flex ${
                mode === Mode.shuffle ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"
              }`}
            >
              <Shuffle className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); prevTrack(); }}
              className="text-black dark:text-white hover:text-black dark:hover:text-white transition-colors"
            >
              <SkipBack className="size-3 md:size-6 fill-black dark:fill-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-on-surface w-10 h-10 hover:bg-on-surface/90 text-surface font-bold text-lg shadow-lg hover:shadow-on-surface/20 transition-all"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? (
                <Pause className="size-4 md:size-6 text-surface fill-surface" />
              ) : (
                <Play className="size-4 md:size-6 text-surface fill-surface" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); nextTrack(); }}
              className="text-black dark:text-white hover:text-black dark:hover:text-white transition-colors"
            >
              <SkipForward className="size-3 md:size-6 fill-black dark:fill-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); toggleLoop(); }}
              className={`transition-colors hidden md:flex ${
                isLooping ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"
              }`}
            >
              <Repeat className="size-5" />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-3 w-full max-w-md">
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
        <div className="flex items-center justify-end gap-1 md:gap-3 w-1/3">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsQueueOpen(!isQueueOpen);
            }}
            className={`transition-colors ${
              isQueueOpen
                ? "text-black dark:text-white"
                : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            <ListMusic className="size-3.5 md:size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-3.5 md:size-5" />
            ) : (
              <Volume2 className="size-3.5 md:size-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-14 md:w-24"
          />
        </div>
      </div>

    </div>

      {isQueueOpen && <QueuePanel onClose={() => setIsQueueOpen(false)} />}

      {/* Mobile Full-Screen Player */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            key="fullscreen-player"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) setIsFullScreen(false);
            }}
            className="md:hidden fixed inset-0 z-[300] bg-gradient-to-b from-surface-container to-background flex flex-col justify-between px-6 py-5 overflow-y-auto"
          >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-on-surface-variant text-xs font-label-caps uppercase tracking-widest">
              Now Playing
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(false)}
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white size-10"
            >
              <ChevronDown className="size-8" />
            </Button>
          </div>

          <div className="flex flex-col justify-center h-auto">
            {/* Album Cover */}
            <div className="flex-shrink-0 flex items-center justify-center py-4">
              {currentTrack.thumbnailUrl ? (
                <img
                  src={currentTrack.thumbnailUrl}
                  alt={currentTrack.title}
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                />
              ) : (
                <div className="w-64 h-64 rounded-2xl bg-surface-variant flex items-center justify-center text-6xl shadow-2xl">
                  🎵
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="mt-4 mb-3 text-center">
              <h2 className="text-on-surface font-bold text-xl truncate">
                {currentTrack.title}
              </h2>
              <p className="text-on-surface-variant text-sm mt-1 truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] text-on-surface-variant w-10 text-right font-mono">
                {formatDuration(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="flex-1 "
              />
              <span className="text-[10px] text-on-surface-variant w-10 font-mono">
                {formatDuration(duration)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={`transition-colors ${
                  mode === Mode.shuffle ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"
                } hover:text-black dark:hover:text-white`}
              >
                <Shuffle className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTrack}
                className="text-black dark:text-white hover:text-black dark:hover:text-white transition-colors"
              >
                <SkipBack className="size-6 fill-black dark:fill-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-14 rounded-full bg-on-surface hover:scale-105 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="size-7 text-surface fill-surface" />
                ) : (
                  <Play className="size-7 text-surface fill-surface" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                className="text-black dark:text-white hover:text-black dark:hover:text-white transition-colors"
              >
                <SkipForward className="size-6 fill-black dark:fill-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLoop}
                className={`transition-colors ${
                  isLooping ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"
                } hover:text-black dark:hover:text-white`}
              >
                <Repeat className="size-5" />
              </Button>
            </div>
          </div>

          {/* Volume & Queue */}
          <div className="flex items-center justify-center gap-4 mb-10 ">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`transition-colors ${
                isQueueOpen
                  ? "text-black dark:text-white"
                  : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
              }`}
            >
              <ListMusic className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
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
              className="w-20"
            />
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
