import { apiClient } from './client';

// =================== TYPES ===================

export type ImageVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface SignedUploadUrlRequest {
  folder: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface SignedUploadUrlResponse {
  uploadUrl: string;
  relativePath: string;
  expiresAt: string;
  maxFileSize: number;
  contentType: string;
}

export interface SubmitProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    imageUrl: string;
    previousImagePreserved?: boolean;
    changesRemaining?: number;
  };
}

export interface PendingImageInfo {
  imageUrl: string;
  status: string;
  uploadedAt: string;
}

export interface ImageStatusResponse {
  currentVerifiedImage: string | null;
  pendingImage: PendingImageInfo | null;
  imageChangesUsed: number;
  imageChangesRemaining: number;
  maxImageChanges: number;
}

export interface ImageHistoryEntry {
  id: string;
  imageUrl: string | null;
  status: ImageVerificationStatus;
  changeNumber: number;
  uploadedAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  isCurrent: boolean;
}

export interface ImageHistoryResponse {
  history: ImageHistoryEntry[];
  totalChanges: number;
  maxChanges: number;
}

export interface ReuploadGenerateUrlRequest {
  token: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface ReuploadSubmitRequest {
  token: string;
  imageUrl: string;
}

export interface ReuploadResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    imageUrl: string;
    status: ImageVerificationStatus;
  };
}

// =================== CONSTANTS ===================

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const PROFILE_IMAGES_FOLDER = 'profile-images';

// =================== VALIDATION ===================

export function validateProfileImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Only JPEG, PNG, and WebP are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds the maximum limit of 5MB.';
  }
  return null;
}

// =================== API ===================

export const profileImageApi = {
  // ─── SIGNED UPLOAD URL ────────────────────────
  /** Step 1: Get a signed URL for uploading to cloud storage */
  generateSignedUrl: async (
    fileName: string,
    contentType: string,
    fileSize: number
  ): Promise<SignedUploadUrlResponse> => {
    return apiClient.post<SignedUploadUrlResponse>('/upload/generate-signed-url', {
      folder: PROFILE_IMAGES_FOLDER,
      fileName,
      contentType,
      fileSize,
    });
  },

  // ─── UPLOAD TO CLOUD STORAGE ──────────────────
  /** Step 2: Upload the file directly to the signed URL */
  uploadToStorage: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!response.ok) {
      throw new Error('Failed to upload file to cloud storage');
    }
  },

  // ─── SUBMIT PROFILE IMAGE ────────────────────
  /** Step 3: Submit the uploaded image URL to backend */
  submitProfileImage: async (
    userId: string,
    imageUrl: string
  ): Promise<SubmitProfileImageResponse> => {
    return apiClient.post<SubmitProfileImageResponse>(
      `/users/${userId}/profile-image`,
      { imageUrl }
    );
  },

  // ─── GET IMAGE STATUS ─────────────────────────
  /** Check current image verification status and change count */
  getImageStatus: async (): Promise<ImageStatusResponse> => {
    return apiClient.get<ImageStatusResponse>('/users/profile/image-status');
  },

  // ─── GET IMAGE HISTORY ────────────────────────
  /** Get all previous profile images with statuses */
  getImageHistory: async (): Promise<ImageHistoryResponse> => {
    return apiClient.get<ImageHistoryResponse>('/users/profile/image-history');
  },

  // ─── RE-UPLOAD (PUBLIC, TOKEN-BASED) ──────────
  /** Generate upload URL for re-upload after rejection (no JWT needed) */
  generateReuploadUrl: async (
    data: ReuploadGenerateUrlRequest
  ): Promise<SignedUploadUrlResponse> => {
    return apiClient.post<SignedUploadUrlResponse>(
      '/users/profile/image/reupload/generate-url',
      data
    );
  },

  /** Submit re-uploaded image after rejection (no JWT needed) */
  submitReupload: async (
    data: ReuploadSubmitRequest
  ): Promise<ReuploadResponse> => {
    return apiClient.post<ReuploadResponse>(
      '/users/profile/image/reupload',
      data
    );
  },

  // ─── FULL UPLOAD WORKFLOW ─────────────────────
  /**
   * Complete profile image upload workflow:
   * 1. Validate file
   * 2. Get signed URL
   * 3. Upload to cloud storage
   * 4. Submit to backend
   */
  uploadProfileImage: async (
    userId: string,
    file: File,
    onProgress?: (step: 'validating' | 'signing' | 'uploading' | 'submitting' | 'done', percent: number) => void
  ): Promise<SubmitProfileImageResponse> => {
    // Validate
    onProgress?.('validating', 0);
    const validationError = validateProfileImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Get signed URL
    onProgress?.('signing', 20);
    const { uploadUrl, relativePath } = await profileImageApi.generateSignedUrl(
      file.name,
      file.type,
      file.size
    );

    // Upload to cloud storage
    onProgress?.('uploading', 40);
    await profileImageApi.uploadToStorage(uploadUrl, file);

    // Submit to backend
    onProgress?.('submitting', 75);
    const fullUrl = relativePath.startsWith('http')
      ? relativePath
      : `https://storage.googleapis.com/${relativePath}`;

    const result = await profileImageApi.submitProfileImage(userId, fullUrl);

    onProgress?.('done', 100);
    return result;
  },

  // ─── FULL RE-UPLOAD WORKFLOW ──────────────────
  /**
   * Complete re-upload workflow (public, token-based):
   * 1. Validate file
   * 2. Get signed URL via token
   * 3. Upload to cloud storage
   * 4. Submit re-upload via token
   */
  reuploadProfileImage: async (
    token: string,
    file: File,
    onProgress?: (step: 'validating' | 'signing' | 'uploading' | 'submitting' | 'done', percent: number) => void
  ): Promise<ReuploadResponse> => {
    // Validate
    onProgress?.('validating', 0);
    const validationError = validateProfileImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Get signed URL
    onProgress?.('signing', 20);
    const { uploadUrl, relativePath } = await profileImageApi.generateReuploadUrl({
      token,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    });

    // Upload to cloud storage
    onProgress?.('uploading', 40);
    await profileImageApi.uploadToStorage(uploadUrl, file);

    // Submit re-upload
    onProgress?.('submitting', 75);
    const fullUrl = relativePath.startsWith('http')
      ? relativePath
      : `https://storage.googleapis.com/${relativePath}`;

    const result = await profileImageApi.submitReupload({
      token,
      imageUrl: fullUrl,
    });

    onProgress?.('done', 100);
    return result;
  },
};
