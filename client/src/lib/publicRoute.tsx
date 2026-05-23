import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "@/states/userState";
export default function PublicRoute() {
  const { userData, isLoading } = useUser();

  if (!isLoading) {
    return !userData ? (
      <>
        <Outlet />
      </>
    ) : (
      <Navigate to={"/"} />
    );
  }
}
