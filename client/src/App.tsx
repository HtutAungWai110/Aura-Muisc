import Library from "./pages/Library";
import Login from "./pages/Login";
import PlaylistPage from "./pages/PlaylistPage";
import ProtectedRoute from "./lib/protectedRoute";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import PublicRoute from "./lib/publicRoute";
import { useUser } from "./states/userState";
import { useEffect } from "react";
import PlaylistsPage from "./pages/PlaylistsPage";

function App() {
  const { fetchUserData, userData } = useUser();
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Library />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
