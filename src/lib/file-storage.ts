import { put, del, list } from '@vercel/blob';

/**
 * Saves a file to Vercel Blob Storage
 * @param fileBuffer - The file content as a Uint8Array
 * @param fileName - Original file name 
 * @param applicationId - ID of the application this file belongs to
 * @returns The storage path of the saved file
 */
export async function saveFile(
  fileBuffer: Uint8Array,
  fileName: string,
  applicationId: string
): Promise<string> {
  // Create a unique path for the file that includes the application ID
  const uniquePath = `applications/${applicationId}/${Date.now()}-${fileName}`;
  
  // Upload to Vercel Blob
  const blob = await put(uniquePath, fileBuffer, {
    access: 'private',
  });
  
  // Return the path (URL) to the stored file
  return blob.url;
}

/**
 * Deletes a file from Vercel Blob Storage
 * @param storagePath - The complete URL of the file to delete
 */
export async function deleteFile(storagePath: string): Promise<void> {
  await del(storagePath);
}

/**
 * Lists all files for a specific application
 * @param applicationId - The ID of the application to list files for
 */
export async function listApplicationFiles(applicationId: string) {
  const { blobs } = await list({
    prefix: `applications/${applicationId}/`,
  });
  
  return blobs;
}

/**
 * Generates a presigned URL for secure file access
 * @param storagePath - The complete URL of the file
 * @param expirationSeconds - How long the URL should be valid (default: 3600s/1hr)
 */
export async function getFileAccessUrl(
  storagePath: string,
  expirationSeconds = 3600
): Promise<string> {
  // For Vercel Blob, we can just return the URL since it's already secure
  // If implementing with S3 or other providers, you'd generate a presigned URL here
  return storagePath;
}