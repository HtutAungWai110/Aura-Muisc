import { useEffect, useState } from "react";
import type { Area } from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { base64ToFile } from "@/lib/convertImage";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import PhotoCropper from "@/components/PhotoCropper";
import { Calendar, Check, X } from "lucide-react";
import type { Playlist } from "@/types/PlaylistType";
import CoverPhotoDisplay from "./CoverPhotoDisplay";

interface PlaylistEditPanelProps {
  playlist: Playlist;
  onClose: () => void;
}

export default function PlaylistEditPanel({
  playlist,
  onClose,
}: PlaylistEditPanelProps) {
  const [isTitleEditMode, setIsTitleEditMode] = useState(false);
  const [titleInput, setTitleInput] = useState(playlist.title);

  const handleTitleClick = () => {
    setTitleInput(playlist.title);
    setIsTitleEditMode(true);
  };

  return (
    <div className="space-y-6 z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-background/50 ">
      <div className="flex justify-between gap-5 bg-surface-container-highest rounded-2xl p-10">
        <CoverPhotoDisplay
          isOnEditMode={true}
          coverPhotoUrl={playlist.coverPhotoUrl}
          playlistId={playlist._id}
        />
        <div className="relative group ">
          <div className="space-y-3">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full px-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 text-on-surface"
              placeholder="Enter playlist title"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-on-surface-variant hover:bg-primary/10"
              >
                Cancel
              </Button>
              <Button variant="default" size="sm" disabled={!titleInput.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
