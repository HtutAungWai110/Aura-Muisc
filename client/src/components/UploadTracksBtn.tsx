import { Button } from "./ui/button";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "./ui/spinner";
import { useErrorStore } from "@/states/ErrorState";
import { uploadSingleTrack } from "@/lib/uploadHelpers";
import { useUploadStore } from "@/states/UploadState"
import { useQueryClient } from "@tanstack/react-query";

export default function UploadTracksBtn() {
  const { previewTracks, clearAudioTracks } = useTrackImportsState();
  const { setError } = useErrorStore();
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
          for (const track of tracks) {
            await uploadSingleTrack(track, (trackId, pct) => {
              setFileProgress(newKey, trackId, pct);
            });
          }
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
      <Button onClick={clearAudioTracks}>Clear All</Button>
      <Button
        className="flex justify-center items-center gap-1"
        disabled={uploadMutation.isPending}
        onClick={() => uploadMutation.mutate()}
      >
        {uploadMutation.isPending && <Spinner />}
        Upload
      </Button>
    </div>
  );
}
