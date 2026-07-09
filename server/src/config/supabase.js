import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a file buffer to a Supabase storage bucket.
 * @param {string} bucketName - The name of the bucket.
 * @param {string} fileName - The file name (including path) within the bucket.
 * @param {Buffer} fileBuffer - The file data as a Buffer.
 * @param {string} contentType - MIME type of the file.
 * @returns {Promise<object>} The upload result data.
 */
export async function uploadFile(bucketName, fileName, fileBuffer, contentType) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return { data, publicUrl };
}

/**
 * Delete a file from a Supabase storage bucket using its public URL.
 * Extracts the encoded filename from the URL, decodes it, and removes it.
 * @param {string} bucketName - The name of the bucket.
 * @param {string} publicUrl - The public URL of the file (as returned by getPublicUrl).
 */
export async function deleteFileByUrl(bucketName, publicUrl) {
  try {
    const urlParts = publicUrl.split('/');
    let fileName = urlParts[urlParts.length - 1];
    // Decode URL encoding (e.g., %20 -> space)
    fileName = decodeURIComponent(fileName);

    const { error } = await supabase.storage.from(bucketName).remove([fileName]);
    if (error) throw error;
  } catch (err) {
    // Re-throw to be handled by caller
    throw err;
  }
}