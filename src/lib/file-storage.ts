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
  const uniquePath = `applications/${applicationId}/${Date.now()}-${fileName}`;

  const blob = await put(uniquePath, Buffer.from(fileBuffer), {
    access: 'public',
  });

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

export async function getFileAccessUrl(storagePath: string): Promise<string> {
  return storagePath;
}