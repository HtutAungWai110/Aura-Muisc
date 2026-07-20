import apiClient from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import type { Playlist } from "@/types/PlaylistType";
import { usePlaylistStore } from "@/states/PlaylistState";
import { useSuccessStore } from "@/states/SuccessState";

export default function CreatePlaylistBtn() {
  const [isCreating, setCreating] = useState<boolean>(false);
  const [playlistTitle, setPlaylistTitle] = useState<string>("");
  const { addPlaylist } = usePlaylistStore();
  const { setSuccessMessage } = useSuccessStore();

  function handlePlaylistInputChange(e) {
    setPlaylistTitle(e.target.value);
  }

  function handleClose() {
    setCreating(false);
    setPlaylistTitle("");
  }
  const createMutation = useMutation({
    mutationKey: ["playlisst"],
    mutationFn: async (): Promise<Playlist> => {
      const res = await apiClient.post(
        "/api/playlist/create",
        { playlistTitle },
      );
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(`Successfully created ${playlistTitle}`);
      setPlaylistTitle("");
      setCreating(false);
      addPlaylist(data);
    },
  });

  if (isCreating) {
    return (
      <div className="p-5 shadow-2xl border border-on-surface/20 rounded-2xl flex flex-col gap-5 mx-auto">
        <input
          type="text"
          value={playlistTitle}
          onChange={handlePlaylistInputChange}
          className="w-full shadow-2xl p-2 bg-on-surface/5 rounded-xl"
          placeholder="Enter playlist title"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="border border-black/50 dark:border-white/50 text-black dark:text-white"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/20 dark:hover:bg-white/20" onClick={() => createMutation.mutate()}>Create</Button>
        </div>
      </div>
    );
  } else {
    return (
      <Button
        onClick={() => setCreating(!isCreating)}
        className="flex gap-3 items-center bg-black dark:bg-white/20 w-full rounded-full p-5"
      >
        <PlusCircle />
        Create Playlist
      </Button>
    );
  }
}
