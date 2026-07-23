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

async function uploadWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
}

export async function uploadBatchTracks(
  tracks: TrackPreview[],
  onProgress: (trackId: string, pct: number) => void,
) {
  const durations = await Promise.all(tracks.map((t) => getAudioDuration(t.rawFile)));

  const files = tracks.map((track, i) => {
    const body: Record<string, string> = {
      audioFilename: track.rawFile.name,
    };
    if (track.thumbnailUrl) {
      body.imageFilename = `thumb-${track.name}.jpg`;
    }
    return body;
  });

  const { data: urlData } = await apiClient.post(
    "/api/track/get-upload-urls",
    { files },
  );

  const uploadTasks = tracks.map((track, i) => async () => {
    const { audio, image } = urlData.urls[i];
    const audioFile = track.rawFile;
    const audioContentType = audioFile.type || "audio/mpeg";

    await putWithProgress(
      audio.uploadUrl,
      audioFile,
      audioContentType,
      (pct) => onProgress(track.id, pct),
    );

    if (track.thumbnailUrl && image) {
      const thumbnailBlob = dataUriToBlob(track.thumbnailUrl);
      await putWithProgress(image.uploadUrl, thumbnailBlob, "image/jpeg");
    }

    return {
      title: track.title,
      artist: track.artist,
      audioStoragePath: audio.storagePath,
      imageStoragePath: image?.storagePath ?? null,
      duration: durations[i],
    };
  });

  const metadataList = await uploadWithConcurrency(uploadTasks, 3);

  const { data } = await apiClient.post(
    "/api/track/save-metadata",
    { tracks: metadataList },
  );

  return data.tracks;
}
