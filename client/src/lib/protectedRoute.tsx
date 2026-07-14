import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "@/states/userState";
import AudioPlayer from "../components/AudioPlayer";
import { useEffect } from "react";
import { usePlaylistStore } from "@/states/PlaylistState";
import { useTracksCountStore } from "@/states/TrackCountState";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import UploadProgress from "../components/UploadProgress";

export default function ProtectedRoute() {
  const { userData, isLoading } = useUser();
  const { isPending: playlistLoading, fetchPlaylists } = usePlaylistStore();
  const { getTracksCount } = useTracksCountStore();

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    getTracksCount();
  }, [getTracksCount]);

  if (!isLoading && !playlistLoading) {
    return userData ? (
      <>
        <Sidebar />
        <Outlet />

        <AudioPlayer />
        <ErrorMessage />
        <SuccessMessage />
        <UploadProgress />
      </>
    ) : (
      <Navigate to={"/login"} />
    );
  }
}
