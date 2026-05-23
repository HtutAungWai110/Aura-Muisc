import CreatePlaylistBtn from "@/components/CreatePlaylistBtn";

const Library = () => (
  <main className="ml-80 min-h-screen p-container-padding-desktop flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full -z-10 bg-surface">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[100px]"></div>
    </div>
    <section className="max-w-4xl w-full">
      <div className="mb-12">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">
          Sonic Immersion
        </h1>
        <p className="text-on-surface-variant font-body-lg">
          Select a track from your library to begin the experience.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative h-[400px] rounded-lg overflow-hidden group">
          <img
            alt="Electric Beats"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuJfT2wkhZUUMeEa3dCtG4fpkZ4C1dL_rkyYalncT3UFu4SRQ9IBIwS7UqXxQWlvAUceQidYKSMrEkK2zNjvQZrgJ7TbnTffJzO2Hyh8vqSueiy3-LMGLSAdYHHmpv1PsbsHwFrSNBFKzVjE7YEcgzQZmJDLU3YIdrz4Zdj4zeKuv1DRW6CIkaN9_I9EH-JH8koXX5renbuVKGqzof2gq98uO-lyIRk-ISz1m_f_XhwMFBPEPGGwVZdQ_UMTS_v0CV7f6fttUmpCc"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <span className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary px-3 py-1 rounded-full text-label-caps mb-4 inline-block">
              TRENDING NOW
            </span>
            <h2 className="font-headline-lg text-headline-lg text-white">
              Electric Horizon
            </h2>
            <p className="text-white/70 font-body-sm mt-2">
              New Album by Midnight Pulse
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-surface-container-high rounded-lg p-6 flex flex-col justify-between border border-white/5">
            <span className="material-symbols-outlined text-secondary text-4xl">
              graphic_eq
            </span>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface">
                Visualizer
              </h3>
              <p className="text-on-surface-variant font-body-sm">
                Calibrate your rhythmic experience
              </p>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-primary/10 to-secondary-container/10 backdrop-blur-xl rounded-lg p-6 flex flex-col justify-between border border-white/10">
            <span className="material-symbols-outlined text-primary text-4xl">
              workspace_premium
            </span>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface">
                High Fidelity
              </h3>
              <p className="text-on-surface-variant font-body-sm">
                Lossless audio streaming enabled
              </p>
            </div>
          </div>
        </div>

        <div>
          <CreatePlaylistBtn />
        </div>
      </div>
    </section>
  </main>
);

export default Library;
