import type { TrackPreview } from "@/states/TrackImportsState";
import apiClient from "./apiClient";

export function dataUriToBlob(dataUri: string): Blob {
  const [, data] = dataUri.split(",");
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: "image/jpeg" });
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
  });
}

export function putWithProgress(
  url: string,
  body: Blob,
  contentType: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(body);
  });
}

export async function uploadSingleTrack(
  track: TrackPreview,
  onProgress: (trackId: string, pct: number) => void,
) {
  const audioFile = track.rawFile;
  const duration = await getAudioDuration(audioFile);

  const requestBody: Record<string, string> = {
    audioFilename: audioFile.name,
    audioFileType: audioFile.type,
  };

  let thumbnailBlob: Blob | null = null;
  if (track.thumbnailUrl) {
    thumbnailBlob = dataUriToBlob(track.thumbnailUrl);
    requestBody.imageFilename = `thumb-${track.name}.jpg`;
    requestBody.imageFileType = "image/jpeg";
  }

  const { data: urlData } = await apiClient.post(
    "/api/track/get-upload-urls",
    requestBody,
  );

  const audioContentType = audioFile.type || "audio/mpeg";
  await putWithProgress(
    urlData.audio.uploadUrl,
    audioFile,
    audioContentType,
    (pct) => onProgress(track.id, pct),
  );

  if (thumbnailBlob && urlData.image) {
    await putWithProgress(
      urlData.image.uploadUrl,
      thumbnailBlob,
      "image/jpeg",
    );
  }

  const { data: savedTrack } = await apiClient.post(
    "/api/track/save-metadata",
    {
      title: track.title,
      artist: track.artist,
      audioStoragePath: urlData.audio.storagePath,
      imageStoragePath: urlData.image?.storagePath ?? null,
      duration,
    },
  );

  return savedTrack;
}
