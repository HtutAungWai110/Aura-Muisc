import { Button } from "./ui/button";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "./ui/spinner";
import { useErrorStore } from "@/states/ErrorState";
import { uploadMultipleTracks } from "@/lib/uploadHelpers";
import { useUploadStore } from "@/states/UploadState"
import { useQueryClient } from "@tanstack/react-query";
import { useTracksCountStore } from "@/states/TrackCountState";

export default function UploadTracksBtn() {
  const { previewTracks, clearAudioTracks } = useTrackImportsState();
  const { setError } = useErrorStore();
  const { setTracksCount } = useTracksCountStore();
  const { addNewUpload, isKeyExist, removeUpload, setFileProgress } =
    useUploadStore()
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!previewTracks || previewTracks.length === 0) return null;

      let newKey = Date.now().toString();
      while (isKeyExist(newKey)) {
        newKey = Date.now().toString();
      }

      const tracks = [...previewTracks];
      addNewUpload(newKey, tracks);
      clearAudioTracks();

      (async () => {
        try {
          await uploadMultipleTracks(tracks, (trackId, pct) => {
            setFileProgress(newKey, trackId, pct);
          });
          setTracksCount(tracks.length);
          queryClient.invalidateQueries({ queryKey: ["Tracks"] });
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Upload failed";
          console.error(msg);
          setError(msg);
        } finally {
          removeUpload(newKey);
        }
      })();

      return newKey;
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message ?? error.message ?? "Upload failed";
      console.error(msg);
      setError(msg);
    },
  });

  return (
    <div className="flex justify-end gap-2 mb-5">
      <Button onClick={clearAudioTracks} variant="ghost" className="border border-black/50 dark:border-white/50 text-black dark:text-white">Clear All</Button>
      <Button
        className="flex justify-center items-center gap-1 bg-black dark:bg-white text-white dark:text-black hover:bg-black/20 dark:hover:bg-white/20"
        disabled={uploadMutation.isPending}
        onClick={() => uploadMutation.mutate()}
      >
        {uploadMutation.isPending && <Spinner />}
        Upload
      </Button>
    </div>
  );
}
