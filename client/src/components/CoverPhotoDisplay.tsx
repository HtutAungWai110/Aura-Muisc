import { useState } from "react";
import type { Area } from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { base64ToFile } from "@/lib/convertImage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { usePlaylistStore } from "@/states/PlaylistState";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { Spinner } from "./ui/spinner";
import PhotoCropper from "./PhotoCropper";
import { useRef } from "react";
import { Music, Camera } from "lucide-react";

interface CoverPhotoDisplayProps {
  coverPhotoUrl: string | null;
  playlistId: string;
  isOnEditMode: boolean;
}

export default function CoverPhotoDisplay({
  coverPhotoUrl,
  playlistId,
  isOnEditMode,
}: CoverPhotoDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const { updatePlaylist } = usePlaylistStore();

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCoverMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post(
        `/api/playlist/${playlistId}/cover`,
        formData,
        {
          withCredentials: true,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`Playlist ${playlistId}`] });
      const { updatedPlaylist } = data;
      updatePlaylist(playlistId, updatedPlaylist);

      setSelectedImage(null);
    },
  });

  const handleSaveCrop = async () => {
    if (selectedImage && croppedAreaPixels) {
      try {
        const base64 = await getCroppedImg(selectedImage, croppedAreaPixels);
        const croppedFile = base64ToFile(base64, "playlist-cover.jpg");
        if (isOnEditMode) {
          const imageUrl = URL.createObjectURL(croppedFile);
          setCroppedImage(imageUrl);
          setSelectedImage(null);
        } else {
          const form = new FormData();
          form.append("cover", croppedFile);
          uploadCoverMutation.mutate(form);
        }
      } catch (error) {
        console.error("Failed to crop image", error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div>
      {selectedImage && (
        <div className="fixed inset-0 z-[100] backdrop-blur-xl flex flex-col">
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

      <div className="size-56 md:size-64 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 relative group">
        {coverPhotoUrl || croppedImage ? (
          <img
            src={`${croppedImage ? croppedImage : coverPhotoUrl}`}
            alt={"Cover Photo"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center from-surface-container-high to-surface-container-low">
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
    </div>
  );
}
