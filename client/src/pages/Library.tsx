import ImportTrackBtn from "@/components/ImportTrackBtn";
import apiClient from "@/lib/apiClient";
import TrackPreviewWrapper from "@/components/TrackPreviewsWrapper";
import TracksWrapper from "@/components/TracksWrapper";
import { useTrackImportsState } from "@/states/TrackImportsState";
import { useInfiniteQuery } from "@tanstack/react-query";
import PlaylistsWrapper from "@/components/PlaylistsWrappers";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScrollObserver } from "@/hooks/useInfiniteScrollObserver";

export default function Library() {
  const { previewTracks } = useTrackImportsState();

  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["Tracks"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(`/api/track/all?page=${pageParam}`);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    retryOnMount: false,
    retry: false,
  });

  const tracks = data?.pages.flatMap((page) => page.tracks) ?? [];

  const { sentinelRef } = useInfiniteScrollObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage ?? false,
  });

  return (
    <main className="md:ml-80 min-h-screen p-container-padding-mobile md:p-container-padding-desktop flex flex-col items-center justify-start relative overflow-hidden pb-32">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-surface">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-on-surface/3 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-outline/3 rounded-full blur-[100px]"></div>
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

        <div className="flex justify-center md:justify-start">
          <ImportTrackBtn />
        </div>

        {previewTracks && <TrackPreviewWrapper />}

        <PlaylistsWrapper />

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-8 text-on-surface" />
          </div>
        ) : (
          <>
            <TracksWrapper tracks={tracks} />
            <div ref={sentinelRef} className="flex justify-center py-6">
              {isFetchingNextPage && <Spinner className="size-6 text-on-surface" />}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
