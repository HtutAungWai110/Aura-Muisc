import Library from "./pages/Library";
import Login from "./pages/Login";
import PlaylistPage from "./pages/PlaylistPage";
import ProtectedRoute from "./lib/protectedRoute";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import PublicRoute from "./lib/publicRoute";
import { useUser } from "./states/userState";
import { useEffect } from "react";

function App() {
  const { fetchUserData } = useUser();
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Library />} />
          <Route path="/library" element={<Library />} />
          <Route path="/discover" element={<div>Discover Page</div>} />
          <Route path="/playlists" element={<div>Playlists Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
