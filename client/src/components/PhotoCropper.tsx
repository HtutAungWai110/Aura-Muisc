import { useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface PhotoCropperProps {
  imageUrl: string;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
}

export default function PhotoCropper({
  imageUrl,
  onCropComplete,
}: PhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  if (imageUrl) {
    return (
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />
    );
  }
  return null;
}
