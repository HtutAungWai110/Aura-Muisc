import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setTokensFromHash, getAccessToken } from "@/lib/apiClient";
import { useUser } from "@/states/userState";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { fetchUserData } = useUser();

  useEffect(() => {
    setTokensFromHash();

    if (getAccessToken()) {
      fetchUserData().then(() => {
        navigate("/", { replace: true });
      });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, fetchUserData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh text-on-surface font-body-lg">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 glass-panel rounded-2xl animate-pulse">
          <span
            className="material-symbols-outlined text-on-surface"
            style={{ fontSize: "36px" }}
          >
            music_note
          </span>
        </div>
        <p className="text-on-surface-variant">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
