import ImportTrackBtn from "@/components/ImportTrackBtn";
import apiClient from "@/lib/apiClient";
import TrackPreviewWrapper from "@/components/TrackPreviewsWrapper";
import TracksWrapper from "@/components/TracksWrapper";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useQuery } from "@tanstack/react-query";
import PlaylistsWrapper from "@/components/PlaylistsWrappers";
import { usePlaybackState } from "@/states/PlaybackState";
import { useEffect } from "react";

export default function Library() {
  const { previewTracks } = useTrackImportsState();
  const { mode } = usePlaybackState();
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["Tracks"],
    queryFn: async () => {
      const res = await apiClient.get("/api/track/all");
      return res.data;
    },
    retryOnMount: false,
    retry: false,
  });

  useEffect(() => {
    console.log(mode);
  }, [mode]);

  return (
    <main className="md:ml-80 min-h-screen p-container-padding-mobile md:p-container-padding-desktop flex flex-col items-center justify-start relative overflow-hidden pb-32">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-surface">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[100px]"></div>
      </div>

      <section className="w-full">
        <div className="mb-5">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">
            Sonic Immersion
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Select a track from your library to begin the experience.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <ImportTrackBtn />
        </div>

        {previewTracks && <TrackPreviewWrapper />}

        <PlaylistsWrapper />

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="text-on-surface-variant">Loading library...</span>
          </div>
        ) : (
          tracks && (
            <>
              <TracksWrapper tracks={tracks} />
            </>
          )
        )}
      </section>
    </main>
  );
}
