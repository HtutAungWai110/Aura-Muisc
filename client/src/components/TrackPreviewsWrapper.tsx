import { useTrackImportsState } from "@/states/TrackImportsState";
import TrackPreviewCard from "./TrackPreview";
import UploadTracksBtn from "./UploadTracksBtn";

export default function TrackPreviewWrapper() {
  const { previewTracks } = useTrackImportsState();

  if(!previewTracks || previewTracks.length === 0) return null;
  return (
    <>

      <div className="flex flex-wrap gap-2 mt-5">
        {previewTracks.map((track) => {
          return <TrackPreviewCard key={track.id} track={track} />;
        })}
      </div>
      <UploadTracksBtn />
    </>
  );
}
