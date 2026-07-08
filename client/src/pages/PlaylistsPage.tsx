import PlaylistsWrapper from "@/components/PlaylistsWrappers";
import CreatePlaylistBtn from "@/components/CreatePlaylistBtn";

export default function PlaylistsPage() {
  return (
    <main className="ml-80 min-h-screen p-container-padding-desktop flex flex-col items-center justify-start relative overflow-hidden pb-32">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-surface">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[100px]"></div>
      </div>

      <section className="max-w-4xl w-full">
        <div className="mb-5">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">
            Your Playlists
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Create and manage your playlists here.
          </p>
        </div>

        <div className="flex justify-start w-[400px]">
          <CreatePlaylistBtn />
        </div>

        <PlaylistsWrapper />
      </section>
    </main>
  );
}
