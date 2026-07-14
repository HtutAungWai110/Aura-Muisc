import { useState } from "react";
import { Button } from "./ui/button";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "./ui/spinner";
import { useSuccessStore } from "@/states/SuccessState";
import { useQueryClient } from "@tanstack/react-query";
import { useErrorStore } from "@/states/ErrorState";
import { uploadSingleTrack } from "@/lib/uploadHelpers";

export default function UploadTracksBtn() {
  const { previewTracks, clearAudioTracks } = useTrackImportsState();
  const { setError } = useErrorStore();
  const { setSuccessMessage } = useSuccessStore();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!previewTracks || previewTracks.length === 0) return [];

      const results = [];
      for (const track of previewTracks) {
        const saved = await uploadSingleTrack(track, (trackId, pct) => {
          setUploadProgress((prev) => ({ ...prev, [trackId]: pct }));
        });
        results.push(saved);
      }
      return results;
    },
    onSuccess: (data) => {
      setSuccessMessage(`${data?.length ?? 0} tracks uploaded successfully`);
      clearAudioTracks();
      setUploadProgress({});
      queryClient.invalidateQueries({ queryKey: ["Tracks"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const msg =
        error.response?.data?.message ?? error.message ?? "Upload failed";
      console.error(msg);
      setError(msg);
    },
  });

  const activeTrackId = previewTracks?.find(
    (t) => uploadProgress[t.id] !== undefined && uploadProgress[t.id] < 100,
  )?.id;
  const activePct = activeTrackId ? uploadProgress[activeTrackId] ?? 0 : 0;

  return (
    <div className="flex justify-end gap-2">
      <Button onClick={clearAudioTracks}>Clear All</Button>
      <Button
        className="flex justify-center items-center gap-1"
        disabled={uploadMutation.isPending}
        onClick={() => uploadMutation.mutate()}
      >
        {uploadMutation.isPending && <Spinner />}
        {uploadMutation.isPending && activeTrackId
          ? `Uploading ${activePct}%`
          : "Upload"}
      </Button>
    </div>
  );
}
