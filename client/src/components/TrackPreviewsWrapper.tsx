import { useTrackImportsState } from "@/states/TrackImportsState";
import TrackPreviewCard from "./TrackPreview";
import UploadTracksBtn from "./UploadTracksBtn";

export default function TrackPreviewWrapper() {
  const { previewTracks } = useTrackImportsState();
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {previewTracks.map((track) => {
          return <TrackPreviewCard key={track.id} track={track} />;
        })}
      </div>
      <UploadTracksBtn />
    </>
  );
}
