import { useUploadStore } from "@/states/UploadState";
import { motion, AnimatePresence } from "motion/react";
import { Spinner } from "./ui/spinner";

export default function UploadProgress() {
  const { uploadMap, progressMap } = useUploadStore();
  const entries = Array.from(uploadMap.entries());

  if (entries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-900 w-80 bg-surface-container-highest border border-white/10 shadow-2xl rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <Spinner className="size-4 text-primary" />
          <span className="text-sm font-medium text-on-surface">
            Uploading {entries.length} {entries.length === 1 ? "batch" : "batches"}
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {entries.map(([key, tracks]) => {
            const progress = progressMap.get(key) ?? {};
            return (
              <div key={key} className="px-4 py-3 border-b border-white/5 last:border-b-0">
                <div className="text-xs text-on-surface-variant mb-2">
                  {tracks.length} {tracks.length === 1 ? "file" : "files"}
                </div>
                <div className="space-y-2">
                  {tracks.map((track) => {
                    const pct = progress[track.id] ?? 0;
                    return (
                      <div key={track.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-on-surface truncate max-w-[200px]">
                            {track.title}
                          </span>
                          <span className="text-on-surface-variant ml-2 shrink-0">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
