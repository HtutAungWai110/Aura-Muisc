import Library from "./pages/Library";
import Login from "./pages/Login";
import PlaylistPage from "./pages/PlaylistPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./lib/protectedRoute";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import PublicRoute from "./lib/publicRoute";
import { useUser } from "./states/userState";
import { useEffect } from "react";
import PlaylistsPage from "./pages/PlaylistsPage";
import AuthCallback from "./pages/AuthCallback";

function App() {
  const { fetchUserData } = useUser();
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Library />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
