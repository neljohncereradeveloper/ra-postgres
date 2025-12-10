// domain/repositories/file.repository.ts
export type UploadedFileInput = {
  original_name: string; // Original name of the file
  mime_type: string; // MIME type of the file
  size: number; // File size in bytes
  buffer: Buffer; // File content in buffer form
};
