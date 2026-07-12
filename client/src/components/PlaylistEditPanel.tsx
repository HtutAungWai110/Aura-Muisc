import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { Playlist } from "@/types/PlaylistType";
import CoverPhotoDisplay from "./CoverPhotoDisplay";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useSuccessStore } from "@/states/SuccessState";
import { useErrorStore } from "@/states/ErrorState";
import { Spinner } from "./ui/spinner";
import { usePlaylistStore } from "@/states/PlaylistState";

interface PlaylistEditPanelProps {
  playlist: Playlist;
  onClose: () => void;
}

export default function PlaylistEditPanel({
  playlist,
  onClose
}: PlaylistEditPanelProps) {
  const [titleInput, setTitleInput] = useState(playlist.title);
  const panelRef = useRef<HTMLDivElement>(null);
  const formDataRef = useRef<FormData>(new FormData());
  const queryClient = useQueryClient();
  const { setSuccessMessage } = useSuccessStore();
  const { setError } = useErrorStore();
  const { updatePlaylist } = usePlaylistStore();

  const handleAppendFile = (payload: File) => {
    formDataRef.current.append("cover", payload)
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/api/playlist/update/${playlist._id}`, formDataRef.current)
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message)
      queryClient.invalidateQueries({ queryKey: [`Playlist ${playlist._id}`] });
      updatePlaylist(playlist._id, data.playlist);
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSave = () => {
    if (titleInput.trim() === playlist.title && !formDataRef.current.get("cover")) {
      onClose();
      return;
    }
    if (titleInput.trim() && titleInput.trim() !== playlist.title) formDataRef.current.append("title", titleInput.trim());
    updateMutation.mutate()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-md space-y-6 p-4"


    >
      <div ref={panelRef} className="flex  justify-between gap-5 bg-surface-container-highest/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-8  relative">

        {/* Close icon (X) */}
        <button
          className="absolute top-2 right-2 text-on-surface-variant/hover text-sm hover:bg-primary/10 rounded-full p-1"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <CoverPhotoDisplay
          isOnEditMode={true}
          coverPhotoUrl={playlist.coverPhotoUrl}
          playlistId={playlist._id}
          appendFile={handleAppendFile}
        />
        <div className="relative group ">
          <div className="space-y-3">
            <div>
              <p>Add cover photo or change playlist title</p>
            </div>
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
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                disabled={!titleInput.trim() || updateMutation.isPending}
                onClick={handleSave}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-1"
              >
                Save
                {updateMutation.isPending && <Spinner />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
