import { supabase } from "../config/supabase.js";

function extractStorageFromUrl(publicUrl) {
  const marker = "/object/public/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const rest = publicUrl.slice(idx + marker.length);
  const slashIdx = rest.indexOf("/");
  if (slashIdx === -1) return null;
  const bucket = rest.slice(0, slashIdx);
  const path = decodeURIComponent(rest.slice(slashIdx + 1));
  return { bucket, path };
}

async function deleteStorageFile(publicUrl) {
  const storage = extractStorageFromUrl(publicUrl);
  if (!storage) return;
  try {
    await supabase.storage.from(storage.bucket).remove([storage.path]);
  } catch (err) {
    console.warn("Failed to delete file from storage:", err.message);
  }
}

export { extractStorageFromUrl, deleteStorageFile };
