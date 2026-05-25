import { Button } from "./ui/button";
import axios from "axios";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Spinner } from "./ui/spinner";
import { useSuccessStore } from "@/states/SuccessState";

export default function UploadTracksBtn() {
  const { previewTracks, clearAudioTracks } = useTrackImportsState();
  const { setSuccessMessage } = useSuccessStore();
  const uploadMutation = useMutation({
    mutationFn: async () => {
      try {
        const formData = new FormData();
        // 1. Loop and append each file using the field name your backend expects (e.g., "tracks")
        previewTracks.forEach((track) => {
          formData.append("tracks", track.rawFile); // Using 'tracks' plural to match backend expectation
        });
        // 2. Pass formData directly as the body argument
        const res = await axios.post(
          "/api/track/add",
          formData, // <-- Fix: DO NOT wrap this in { tracks: formData }
          {
            withCredentials: true,
          },
        );
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
