import { Button } from "./ui/button";
import axios from "axios";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "./ui/spinner";
import { useSuccessStore } from "@/states/SuccessState";
import { useQueryClient } from "@tanstack/react-query";

export default function UploadTracksBtn() {
  const { previewTracks, clearAudioTracks } = useTrackImportsState();
  const { setSuccessMessage } = useSuccessStore();
  const queryClient = useQueryClient();
  const uploadMutation = useMutation({
    mutationFn: async () => {
      try {
        const formData = new FormData();

        previewTracks.forEach((track) => {
          formData.append("tracks", track.rawFile);
        });

        const res = await axios.post("/api/track/add", formData, {
          withCredentials: true,
        });
        return res.data;
      } catch (error) {
        if (error.response) {
          throw new Error(
            `Status: ${error.response.status}, ${error.response.data.message}`,
            { cause: error },
          );
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      clearAudioTracks();
      queryClient.invalidateQueries({ queryKey: ["Tracks"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  return (
    <div className="flex justify-end">
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
