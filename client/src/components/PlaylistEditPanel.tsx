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
    onClose,
  }: PlaylistEditPanelProps) {
    const [titleInput, setTitleInput] = useState(playlist.title);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const { setSuccessMessage } = useSuccessStore();
    const { setError } = useErrorStore();
    const { updatePlaylist } = usePlaylistStore();

    const handleCoverUploaded = (url: string) => {
      setCoverPhotoUrl(url);
    };

    const updateMutation = useMutation({
      mutationFn: async (body: Record<string, string>) => {
        const res = await apiClient.post(
          `/api/playlist/update/${playlist._id}`,
          body,
        );
        return res.data;
      },
      onSuccess: (data) => {
        setSuccessMessage(data.message);
        queryClient.invalidateQueries({ queryKey: [`Playlist ${playlist._id}`] });
        updatePlaylist(playlist._id, data.playlist);
        onClose();
      },
      onError: (error) => {
        setError(error.message);
      },
    });

    const handleSave = () => {
      const body: Record<string, string> = {};
      if (titleInput.trim() && titleInput.trim() !== playlist.title) {
        body.title = titleInput.trim();
      }
      if (coverPhotoUrl) {
        body.coverPhotoUrl = coverPhotoUrl;
      }
      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }
      updateMutation.mutate(body);
    };

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
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/30 backdrop-blur-md space-y-6 p-4">
      <div
        ref={panelRef}
        className="max-w-[95%] md:max-w-[70%] flex flex-col md:flex-row justify-between gap-5 bg-surface-container-highest/80 backdrop-blur-sm border border-on-surface/10 rounded-2xl p-4 md:p-8 relative"
      >
        <button
          className="absolute top-2 right-2 text-on-surface-variant text-sm hover:bg-on-surface/10 rounded-full p-1"
          onClick={onClose}
          aria-label="Close"
        >
            ×
          </button>
          <CoverPhotoDisplay
            isOnEditMode={true}
            coverPhotoUrl={playlist.coverPhotoUrl}
            playlistId={playlist._id}
            onCoverUploaded={handleCoverUploaded}
          />
          <div className="relative group">
            <div className="space-y-3">
              <div>
                <p className="text-[0.7em] sm:text-[1em]">Add cover photo or change playlist title</p>
              </div>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-4 py-2 border border-on-surface/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-on-surface focus:ring-offset-0 text-on-surface"
                placeholder="Enter playlist title"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-on-surface-variant hover:bg-on-surface/10"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!titleInput.trim() || updateMutation.isPending}
                  onClick={handleSave}
                  size="sm"
                  className="bg-on-surface hover:bg-on-surface/90 text-surface font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-1"
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
