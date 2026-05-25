import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/states/userState";
import CreatePlaylistBtn from "./CreatePlaylistBtn";

interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  path: string;
}

const NavItem = ({ icon, label, isActive, path }: NavItemProps) => (
  <Link
    to={path}
    className={`group flex items-center gap-4 mx-2 px-4 py-3 rounded-full transition-all duration-200 transform active:scale-95 ${
      isActive
        ? "bg-primary-container text-on-primary-container font-bold translate-x-1 active-glow"
        : "text-on-surface-variant hover:bg-surface-variant/50"
    }`}
  >
    <span
      className="material-symbols-outlined transition-colors group-hover:text-primary"
      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
    >
      {icon}
    </span>
    <span className="font-label-caps text-label-caps">{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const { userData } = useUser();
  const { displayName, email, avatar } = userData;
  console.log(userData);

  const navLinks = [
    {
      id: "Library",
      icon: "library_music",
      label: "Library",
      path: "/library",
    },
    { id: "Discover", icon: "explore", label: "Discover", path: "/discover" },
    {
      id: "Playlists",
      icon: "queue_music",
      label: "Playlists",
      path: "/playlists",
    },
  ];

  const checkActive = (path: string) => {
    if (path === "/library" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex flex-col h-full w-80 rounded-r-lg bg-surface-container/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Profile Section */}
      <div className="flex flex-col p-8 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 from-primary to-secondary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
            <img
              src=""
              alt={displayName}
              className="relative w-16 h-16 rounded-full object-cover border-2 border-surface-container"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-primary font-bold font-headline-lg-mobile text-headline-lg-mobile">
              {displayName}
            </span>
            <span className="text-on-surface-variant font-label-caps text-label-caps opacity-80 text-[0.5em] uppercase tracking-widest">
              {email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 bg-white/5 rounded-full p-2 w-full justify-center">
          <span className="material-symbols-outlined text-primary text-[18px]">
            library_music
          </span>
          <span className="text-body-sm font-body-sm text-on-surface-variant">
            1.2k Tracks
          </span>
        </div>

        <div className="mt-5 mb-5">
          <CreatePlaylistBtn />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navLinks.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={checkActive(item.path)}
          />
        ))}
        <div className="my-6 mx-6 border-t border-white/5"></div>
        <NavItem
          icon="settings"
          label="Settings"
          path="/settings"
          isActive={checkActive("/settings")}
        />
      </nav>

      {/* Branding Bottom */}
      <div className="p-8 pb-10 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary-container flex items-center justify-center shadow-lg shadow-primary/20">
            <span
              className="material-symbols-outlined text-on-primary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              music_note
            </span>
          </div>
          <span className="text-primary font-bold font-headline-lg-mobile text-headline-lg-mobile tracking-tight">
            Aura Music
          </span>
        </div>
        <p className="text-[10px] text-on-surface-variant/40 mt-4 font-label-caps">
          v2.4.0 Sonic Immersion
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
