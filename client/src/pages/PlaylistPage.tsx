import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/states/PlaylistState";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { getPlaylist } = usePlaylistStore();
  const initialData = getPlaylist(id);

  const {
    data: playlistData,
    loading,
    error,
  } = useQuery({
    queryKey: [`Playlist ${id}`],
    queryFn: async () => {
      const res = await apiClient.get(`/api/playlist/${id}`, {
        withCredentials: true,
      });
      return res.data;
    },
    retry: false,
    initialData: initialData,
  });

  useEffect(() => {
    if (playlistData) {
      console.log(playlistData);
    }
  }, [playlistData]);

  return (
    <div className="ml-80 min-h-screen p-container-padding-desktop">
      Playlist {id}
    </div>
  );
}
