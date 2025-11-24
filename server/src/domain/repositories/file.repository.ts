// domain/repositories/file.repository.ts
export type UploadedFileInput = {
  originalname: string; // Original name of the file
  mimetype: string; // MIME type of the file
  size: number; // File size in bytes
  buffer: Buffer; // File content in buffer form
};
