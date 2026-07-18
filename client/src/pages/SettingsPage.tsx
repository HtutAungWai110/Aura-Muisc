import { useUser } from "@/states/userState";
import { useTheme } from "@/states/themeState";
import { clearTokens } from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useTracksCountStore } from "@/states/TrackCountState";
import { useEffect } from "react";

export default function SettingsPage() {
  const { userData, clearUserData } = useUser();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { tracksCount } = useTracksCountStore();

  const handleLogout = () => {
    clearTokens();
    clearUserData();
    navigate("/login");
  };

  useEffect(() => {
    console.log(mode)
  }, [mode])

  const joinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown";

  const providerLabel = userData?.provider
    ? userData.provider.charAt(0).toUpperCase() + userData.provider.slice(1)
    : "Unknown";

  return (
    <main className="md:ml-80 min-h-screen p-container-padding-mobile md:p-container-padding-desktop flex flex-col items-center justify-start relative overflow-hidden pb-32">
      <section className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">
            Settings
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Manage your account and preferences.
          </p>
        </div>

        {/* Account Card */}
        <div className="bg-surface-container-high/70 backdrop-blur-xl rounded-2xl border border-outline-variant/30 p-6 mb-4">
          <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest mb-5">
            Account
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
              <img
                src={userData?.avatar}
                alt={userData?.displayName}
                className="relative w-20 h-20 rounded-full object-cover border-2 border-surface-container"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-primary font-bold font-headline-lg-mobile text-headline-lg-mobile truncate">
                {userData?.displayName}
              </span>
              <span className="text-on-surface-variant font-body-sm text-body-sm truncate">
                {userData?.email}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-on-surface-variant/60 font-label-caps text-label-caps">
                  {providerLabel}
                </span>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/30"></span>
                <span className="text-on-surface-variant/60 font-label-caps text-label-caps">
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5 bg-primary/10 rounded-full p-2 w-fit">
            <span className="material-symbols-outlined text-primary text-[18px]">
              library_music
            </span>
            <span className="text-body-sm font-body-sm text-on-surface-variant">
              {tracksCount} Tracks
            </span>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="bg-surface-container-high/70 backdrop-blur-xl rounded-2xl border border-outline-variant/30 p-6 mb-4">
          <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest mb-5">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">
                {mode === "dark" ? "dark_mode" : "light_mode"}
              </span>
              <div className="flex flex-col">
                <span className="text-on-surface font-body-lg">Theme</span>
                <span className="text-on-surface-variant font-body-sm text-body-sm">
                  {mode === "dark" ? "Dark mode" : "Light mode"}
                </span>
              </div>
            </div>
            <Switch
              className="in-dark:bg-primary/10"
              onClick={toggleTheme}
            />
          </div>
        </div>

        {/* Session Card */}
        <div className="bg-surface-container-high/70 backdrop-blur-xl rounded-2xl border border-outline-variant/30 p-6">
          <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest mb-5">
            Session
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-colors font-body-lg active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </section>
    </main>
  );
}
