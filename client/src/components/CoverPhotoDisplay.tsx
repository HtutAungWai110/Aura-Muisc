import { useState, useRef } from "react";
import type { Area } from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { base64ToFile } from "@/lib/convertImage";
import apiClient from "@/lib/apiClient";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { Spinner } from "./ui/spinner";
import PhotoCropper from "./PhotoCropper";
import { Music, Camera } from "lucide-react";
import { useErrorStore } from "@/states/ErrorState";
import { useSuccessStore } from "@/states/SuccessState";
import { useQueryClient } from "@tanstack/react-query";

interface CoverPhotoDisplayProps {
  coverPhotoUrl: string | null;
  playlistId: string;
  isOnEditMode: boolean;
  onCoverUploaded?: (coverUrl: string) => void | null;
}

export default function CoverPhotoDisplay({
  coverPhotoUrl,
  playlistId,
  isOnEditMode,
  onCoverUploaded,
}: CoverPhotoDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setSuccessMessage } = useSuccessStore();
  const { setError } = useErrorStore();

  const handleSaveCrop = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const base64 = await getCroppedImg(selectedImage, croppedAreaPixels);
      const croppedFile = base64ToFile(base64, selectedImage.split("/").pop());

      const { data: urlData } = await apiClient.post(
        "/api/playlist/cover-upload-url",
        { filename: croppedFile.name, fileType: croppedFile.type },
      );

      const imgRes = await fetch(urlData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": croppedFile.type || "image/jpeg" },
        body: croppedFile,
      });
      if (!imgRes.ok) {
        const err = await imgRes.text();
        throw new Error(`Image upload failed (${imgRes.status}): ${err}`);
      }

      if (isOnEditMode) {
        const imageUrl = URL.createObjectURL(croppedFile);
        setCroppedImage(imageUrl);
        onCoverUploaded?.(urlData.publicUrl);
        setSelectedImage(null);
      } else {
        const { data } = await apiClient.post(
          `/api/playlist/${playlistId}/cover`,
          { coverPhotoUrl: urlData.publicUrl },
        );
        queryClient.invalidateQueries({
          queryKey: [`Playlist ${playlistId}`],
        });
        setSuccessMessage(data.message);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Failed to crop image", error);
      setError("Failed to upload cover photo");
    } finally {
      setIsUploading(false);
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
        <div className="fixed left-[50%] top-[50%] w-[100vw] h-[100vh] -translate-x-[50%] -translate-y-[50%] inset-0 z-[999] backdrop-blur-xl flex flex-col ">
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
            </div>
            <Button
              className="rounded-full px-6 gap-2 bg-on-surface text-surface font-bold text-xs md:text-sm"
              onClick={handleSaveCrop}
              disabled={isUploading}
            >
              {isUploading ? (
                <Spinner />
              ) : (
                <>
                  <Check className="size-3 md:size-5" />
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

      <div className="size-40 md:size-64 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 relative group">
        {coverPhotoUrl || croppedImage ? (
          <img
            src={croppedImage ? croppedImage : coverPhotoUrl}
            alt={"Cover Photo"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-variant">
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
