export interface PresignedPutUrlResult {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  requiredHeaders: Record<string, string>;
}

export interface PresignedGetUrlResult {
  downloadUrl: string;
  expiresInSeconds: number;
}

export interface ObjectMetadataResult {
  sizeBytes: number;
  contentType?: string;
  etag?: string;
  lastModified?: Date;
}
