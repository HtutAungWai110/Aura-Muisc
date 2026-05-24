import { useTrackImportsState } from "@/states/TrackImportsState";
import TrackPreviewCard from "./TrackPreview";

export default function TrackPreviewWrapper() {
  const { previewTracks } = useTrackImportsState();
  return (
    <div className="flex gap-3">
      {previewTracks.map((track) => {
        return <TrackPreviewCard key={track.id} track={track} />;
      })}
    </div>
  );
}
