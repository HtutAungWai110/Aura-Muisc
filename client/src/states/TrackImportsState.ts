import { create } from "zustand";
import jsmediatags from "jsmediatags";

export type TrackPreview = {
  id: string;
  name: string;
  title: string;
  artist: string;
  previewUrl: string; // The local blob URL for playback
  thumbnailUrl: string | null; // The base64 extracted album art image
  rawFile: File;
};

interface AudioStore {
  previewTracks: TrackPreview[] | null;
  setAudioTracks: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearAudioTracks: () => void;
  removeTrack: (id: string) => void;
}

export const useTrackImportsState = create<AudioStore>((set, get) => ({
  previewTracks: null,
  setAudioTracks: (e) => {
    const tracks = e.target.files;
    if (tracks.length > 0) {
      const fileArray = Array.from(tracks);

      const parsePromises = fileArray.map((file) => {
        return new Promise<TrackPreview>((resolve) => {
          // Create a temporary local URL for the audio element
          const previewUrl = URL.createObjectURL(file);

          // Attempt to extract embedded ID3 tags (artist, title, thumbnail)
          jsmediatags.read(file, {
            onSuccess: (tag) => {
              const { title, artist, picture } = tag.tags;
              let thumbnailUrl = null;

              if (picture) {
                const { data, type } = picture;
                const base64String = data.reduce(
                  (acc: string, byte: number) =>
                    acc + String.fromCharCode(byte),
                  "",
                );
                thumbnailUrl = `data:${type};base64,${btoa(base64String)}`;
              }

              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                title: title || file.name.replace(/\.[^/.]+$/, ""), // Fallback to filename if no title tag
                artist: artist || "Unknown Artist",
                previewUrl,
                thumbnailUrl,
                rawFile: file,
              });
            },
            onError: () => {
              // Fallback object if the file has no metadata tags
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Unknown Artist",
                previewUrl,
                thumbnailUrl: null, // Renders a generic music icon placeholder
                rawFile: file,
              });
            },
          });
        });
      });

      Promise.all(parsePromises).then((results) => {
        const previews = get().previewTracks;
        if (previews) {
          set((state) => ({
            previewTracks: [...state.previewTracks, ...results],
          }));
        } else {
          set({ previewTracks: results });
        }
      });
    }
  },
  clearAudioTracks: () => {
    set({ previewTracks: null });
  },
  removeTrack: (id) => {
    const tracks = get().previewTracks;
    const trackToKill = tracks.find((t) => t.id === id);
    if (trackToKill) {
      URL.revokeObjectURL(trackToKill.previewUrl);
    }
    set({
      previewTracks:
        tracks.length > 0 ? tracks.filter((track) => track.id != id) : null,
    });
  },
}));
