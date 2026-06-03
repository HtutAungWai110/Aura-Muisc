import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useUser } from "@/states/userState";
import AudioPlayer from "../components/AudioPlayer";

export default function ProtectedRoute() {
  const { userData, isLoading } = useUser();

  if (!isLoading) {
    return userData ? (
      <>
        <Sidebar />
        <Outlet />
        <AudioPlayer />
      </>
    ) : (
      <Navigate to={"/login"} />
    );
  }
}
