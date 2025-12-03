import type { 
  SignedUrlRequest, 
  SignedUrlResponse, 
  VerifyUploadRequest,
  VerifyUploadResponse 
} from '../types/upload';
import { useUserRole } from '@/hooks/useUserRole';

export class UploadService {
  private getBaseUrl(): string {
    const state = useUserRole.getState();
    return state.backendUrl || 'http://localhost:8080';
  }

  private getToken(): string | null {
    const state = useUserRole.getState();
    return state.accessToken;
  }

  /**
   * Step 1: Request signed upload URL from backend
   * Use specific endpoints like /signed-urls/lecture or generic /signed-urls/generate
   */
  async getSignedUrl(
    endpoint: string,
    data: SignedUrlRequest
  ): Promise<SignedUrlResponse> {
    const token = this.getToken();
    const baseUrl = this.getBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get signed URL');
    }

    return response.json();
  }

  /**
   * Step 2: Upload file directly to S3 using PUT method
   * IMPORTANT: Use uploadUrl (not publicUrl) and send raw file with correct Content-Type
   */
  async uploadToS3(
    file: File,
    uploadUrl: string,
    contentType?: string
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType || file.type,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`S3 upload failed: ${text}`);
    }
  }

  /**
   * Complete 3-step upload flow:
   * 1. Request signed URL
   * 2. Upload to S3
   * 3. Return publicUrl for use in API calls
   */
  async uploadFile(
    file: File,
    endpoint: string,
    requestData: SignedUrlRequest,
    onProgress?: (progress: number) => void
  ): Promise<VerifyUploadResponse> {
    try {
      // Step 1: Get signed URL
      onProgress?.(10);
      const signedResponse = await this.getSignedUrl(endpoint, requestData);

      onProgress?.(30);

      // Step 2: Upload to S3 using PUT method
      await this.uploadToS3(file, signedResponse.uploadUrl, requestData.contentType || file.type);
      onProgress?.(100);

      // Step 3: Return publicUrl (not uploadUrl!) for backend API calls
      return {
        publicUrl: signedResponse.publicUrl,
        metadata: {
          fileSize: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
        }
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }
}

export const uploadService = new UploadService();
