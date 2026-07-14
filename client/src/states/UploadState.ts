import { create } from "zustand"
import type { TrackPreview } from "./TrackImportsState"

interface UploadStore {
  uploadMap: Map<string, Array<TrackPreview>>
  progressMap: Map<string, Record<string, number>>
  addNewUpload: (key: string, files: Array<TrackPreview>) => Array<TrackPreview>
  removeUpload: (key: string) => void
  setFileProgress: (uploadKey: string, trackId: string, pct: number) => void
  clearProgress: (uploadKey: string) => void
  isKeyExist: (key: string) => boolean
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploadMap: new Map<string, Array<TrackPreview>>(),
  progressMap: new Map<string, Record<string, number>>(),
  addNewUpload: (key: string, tracks: Array<TrackPreview>) => {
    const { uploadMap } = get()
    uploadMap.set(key, tracks)
    set({ uploadMap: new Map(uploadMap) })
    return tracks
  },
  removeUpload: (key: string) => {
    const { uploadMap, progressMap } = get()
    uploadMap.delete(key)
    progressMap.delete(key)
    set({ uploadMap: new Map(uploadMap), progressMap: new Map(progressMap) })
  },
  setFileProgress: (uploadKey: string, trackId: string, pct: number) => {
    const { progressMap } = get()
    const existing = progressMap.get(uploadKey) ?? {}
    progressMap.set(uploadKey, { ...existing, [trackId]: pct })
    set({ progressMap: new Map(progressMap) })
  },
  clearProgress: (uploadKey: string) => {
    const { progressMap } = get()
    progressMap.delete(uploadKey)
    set({ progressMap: new Map(progressMap) })
  },
  isKeyExist: (key: string) => {
    const { uploadMap } = get()
    return uploadMap.has(key)
  },
}))
