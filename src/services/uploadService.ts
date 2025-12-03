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

  async uploadToS3(
    file: File,
    signedUrl: SignedUrlResponse['signedUrl']
  ): Promise<void> {
    const formData = new FormData();

    // Add all fields from signedUrl.fields in order
    Object.entries(signedUrl.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add file LAST
    formData.append('file', file);

    const response = await fetch(signedUrl.url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`S3 upload failed: ${text}`);
    }
  }


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

      // Step 2: Validate file size
      if (file.size > signedResponse.maxFileSizeBytes) {
        throw new Error(
          `File size exceeds limit of ${(signedResponse.maxFileSizeBytes / (1024 * 1024)).toFixed(0)}MB`
        );
      }

      onProgress?.(30);

      // Step 3: Upload to S3
      await this.uploadToS3(file, signedResponse.signedUrl);
      onProgress?.(100);

      // Return public URL directly without verification
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
