import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/states/PlaylistState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import TracksWrapper from "@/components/TracksWrapper";
import {
  Clock,
  Play,
  Music,
  MoreHorizontal,
  Camera,
  X,
  Check,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Playlist } from "@/types/PlaylistType";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { usePlaybackState } from "@/states/PlaybackState";
import { useRef, useState } from "react";
import PhotoCropper from "@/components/PhotoCropper";
import { getCroppedImg } from "@/lib/cropImage";
import type { Area } from "react-easy-crop";
import { base64ToFile } from "@/lib/convertImage";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { getPlaylist, updatePlaylist } = usePlaylistStore();
  const initialData = getPlaylist(id);
  const { setCurrentTrack, setTracks } = usePlaybackState();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const {
    data: playlistData,
    isLoading,
    isError,
  } = useQuery<Playlist>({
    queryKey: [`Playlist ${id}`],
    queryFn: async () => {
      const res = await apiClient.get(`/api/playlist/${id}`, {
        withCredentials: true,
      });
      return res.data;
    },
    retry: false,
    initialData: initialData,
  });

  const uploadCoverMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Sending as JSON or FormData depending on backend expectation.
      // Given the request for base64, we'll send it in the body.
      const res = await apiClient.post(`/api/playlist/${id}/cover`, formData, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`Playlist ${id}`] });
      const { updatedPlaylist } = data;
      updatePlaylist(id, updatedPlaylist);

      setSelectedImage(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSaveCrop = async () => {
    if (selectedImage && croppedAreaPixels) {
      try {
        const base64 = await getCroppedImg(selectedImage, croppedAreaPixels);
        const croppedFile = base64ToFile(base64, "playlist-cover.jpg");
        const form = new FormData();
        form.append("cover", croppedFile);
        uploadCoverMutation.mutate(form);
      } catch (error) {
        console.error("Failed to crop image", error);
      }
    }
  };

  const handlePlayAll = () => {
    if (playlistData && playlistData.tracks.length > 0) {
      setTracks(playlistData.tracks);
      setCurrentTrack(playlistData.tracks[0]);
    }
  };

  if (isLoading && !playlistData) {
    return (
      <div className="ml-80 min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (isError || !playlistData) {
    return (
      <div className="ml-80 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-on-surface mb-2">Oops!</h2>
          <p className="text-on-surface-variant">
            Could not load the playlist.
          </p>
        </div>
      </div>
    );
  }

  const totalDuration = playlistData.tracks.reduce(
    (acc, track) => acc + track.duration,
    0,
  );

  return (
    <div className="ml-80 min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Photo Cropper Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="rounded-full"
              >
                <X className="size-6" />
              </Button>
              <h2 className="text-xl font-bold">Crop Cover Photo</h2>
            </div>
            <Button
              className="rounded-full px-6 gap-2 bg-primary text-on-primary-container font-bold"
              onClick={handleSaveCrop}
              disabled={uploadCoverMutation.isPending}
            >
              {uploadCoverMutation.isPending ? (
                <Spinner />
              ) : (
                <>
                  <Check className="size-5" />
                  Save Photo
                </>
              )}
            </Button>
          </div>
          <div className="flex-1 relative">
            <PhotoCropper
              imageUrl={selectedImage}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          </div>
        </div>
      )}

      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        {playlistData.coverPhotoUrl && (
          <img
            src={`/api/${playlistData.coverPhotoUrl}`}
            className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
            alt=""
          />
        )}
      </div>

      <div className="p-container-padding-desktop pt-12">
        {/* Playlist Hero */}
        <div className="flex flex-col md:flex-row items-end gap-8 mb-10">
          <div className="size-56 md:size-64 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 bg-surface-container-high relative group">
            {playlistData.coverPhotoUrl ? (
              <img
                src={`/api/${playlistData.coverPhotoUrl}`}
                alt={playlistData.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container-high to-surface-container-low">
                <Music className="size-24 text-on-surface-variant opacity-10" />
              </div>
            )}
            <div
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-8 text-white" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                Add cover photo
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-2 pb-2">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.2em] mb-1">
              Playlist
            </span>
            <h1 className="font-headline-xl text-headline-xl text-on-surface leading-none mb-6 tracking-tight">
              {playlistData.title}
            </h1>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm bg-white/5 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
              <span className="font-bold text-primary">You</span>
              <span className="opacity-40">•</span>
              <span>{playlistData.tracks.length} tracks</span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 mb-8">
          <Button
            className="rounded-full h-14 px-8 gap-3 bg-primary hover:bg-primary/90 text-on-primary-container font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all"
            onClick={handlePlayAll}
          >
            <Play className="size-6 fill-current" />
            Play All
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-12 rounded-full border border-white/10 hover:bg-white/5"
          >
            <MoreHorizontal className="size-6 text-on-surface-variant" />
          </Button>
        </div>

        {/* Tracks List */}
        {playlistData.tracks.length > 0 ? (
          <div className="bg-surface-container/30 backdrop-blur-md rounded-2xl border border-white/5 p-2 mb-12">
            <TracksWrapper tracks={playlistData.tracks} />
          </div>
        ) : (
          <div className="bg-primary/10 w-full h-50 rounded-2xl flex justify-center items-center opacity-60">
            <h1>No tracks in the playlist yet!</h1>
          </div>
        )}
      </div>
    </div>
  );
}
