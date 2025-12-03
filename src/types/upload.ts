export interface SignedUrlRequest {
  userId?: string;
  instituteId?: string;
  organizationId?: string;
  causeId?: string;
  lectureId?: string;
  documentType?: DocumentType;
  fileExtension: string;
  fileName?: string;
  folder?: string;
  contentType?: string;
  maxSizeBytes?: number;
}

export interface SignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  uploadToken: string;
  expiresIn: number;
}

export interface VerifyUploadRequest {
  uploadToken: string;
}

export interface VerifyUploadResponse {
  publicUrl: string;
  metadata: {
    fileSize: number;
    contentType: string;
    uploadedAt: string;
  };
}

export type DocumentType = 
  | 'PRESENTATION'
  | 'ASSIGNMENT'
  | 'READING_MATERIAL'
  | 'VIDEO'
  | 'AUDIO'
  | 'OTHER';

export interface FileConstraints {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}
