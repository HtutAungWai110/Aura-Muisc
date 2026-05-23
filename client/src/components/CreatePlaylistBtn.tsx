import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";

export default function CreatePlaylistBtn() {
  const createMutation = useMutation({
    mutationKey: ["playlisst"],
    mutationFn: async () => {
      const res = await axios.post(
        "/api/playlist/create",
        {},
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <Button
      onClick={() => createMutation.mutate()}
      className="flex gap-3 items-center justify-center"
    >
      <PlusCircle />
      Create Playlist
    </Button>
  );
}
