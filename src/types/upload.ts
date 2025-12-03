export interface SignedUrlRequest {
  userId?: string;
  instituteId?: string;
  organizationId?: string;
  causeId?: string;
  lectureId?: string;
  documentType?: DocumentType;
  fileExtension: string;
  fileName?: string;
}

export interface SignedUrlResponse {
  signedUrl: {
    url: string;
    fields: Record<string, string>;
  };
  uploadToken: string;
  expiresIn: number;
  maxFileSizeBytes: number;
  publicUrl: string;
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
