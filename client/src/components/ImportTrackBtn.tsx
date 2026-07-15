import { PlusCircle } from "lucide-react";
import { Input } from "./ui/input";
import { useEffect } from "react";
import { useTrackImportsState } from "@/states/TrackImportsState";

export default function ImportTrackBtn() {
  const { setAudioTracks, previewTracks } = useTrackImportsState();

  useEffect(() => {
    if (previewTracks) {
      console.log("Preview:", Array.from(previewTracks));
    }
  }, [previewTracks]);
  return (
    <div className="relative md:w-80 w-100 md:h-10 h-15 flex justify-center items-center gap-2 rounded-2xl border border-primary bg-primary/10 hover:scale-105 duration-300">
      <Input
        className="absolute w-full h-full opacity-0 cursor-pointer"
        type="file"
        accept="audio/*"
        multiple
        onChange={setAudioTracks}
      />
      <PlusCircle /> Import track
    </div>
  );
}
