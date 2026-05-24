import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { useErrorStore } from "@/states/ErrorState";
import { useState } from "react";

export default function CreatePlaylistBtn() {
  const [isCreating, setCreating] = useState<boolean>(false);
  const [playlistTitle, setPlaylistTitle] = useState<string>("");

  function handlePlaylistInputChange(e) {
    setPlaylistTitle(e.target.value);
  }

  function handleClose() {
    setCreating(false);
    setPlaylistTitle("");
  }
  const { setError } = useErrorStore();
  const createMutation = useMutation({
    mutationKey: ["playlisst"],
    mutationFn: async () => {
      try {
        const res = await axios.post(
          "/api/playlist/create",
          { playlistTitle },
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
      console.log(data);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  if (isCreating) {
    return (
      <div className="w-full p-5 shadow-2xl border border-primary/50 rounded-2xl flex flex-col gap-5">
        <input
          type="text"
          value={playlistTitle}
          onChange={handlePlaylistInputChange}
          className="w-full shadow-2xl p-2 bg-primary/10 rounded-xl"
          placeholder="Enter playlist title"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="border border-primary"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button onClick={() => createMutation.mutate()}>Create</Button>
        </div>
      </div>
    );
  } else {
    return (
      <Button
        onClick={() => setCreating(!isCreating)}
        className="flex gap-3 items-center justify-center rounded-3xl p-5 w-full text-background/80"
      >
        <PlusCircle />
        Create Playlist
      </Button>
    );
  }
}
