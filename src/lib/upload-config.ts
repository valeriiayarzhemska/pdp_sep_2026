export const ALLOWED_UPLOAD_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// How long a presigned URL stays valid before the client must request a new one.
export const PRESIGN_EXPIRY_MS = 60_000; // 60s

export function isAllowedType(type: string): boolean {
  return (ALLOWED_UPLOAD_TYPES as readonly string[]).includes(type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
