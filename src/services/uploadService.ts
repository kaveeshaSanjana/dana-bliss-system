import { useUserRole } from '@/hooks/useUserRole';

export interface SignedUrlRequest {
  fileName: string;
  fileType: string;
  folder: string;
}

export interface SignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fileName: string;
  expiresIn: number;
}

export class UploadService {
  private getBaseUrl(): string {
    const state = useUserRole.getState();
    return state.backendUrl || 'http://localhost:8080';
  }

  private getToken(): string | null {
    const state = useUserRole.getState();
    return state.accessToken;
  }

  async getSignedUrl(data: SignedUrlRequest): Promise<SignedUrlResponse> {
    const token = this.getToken();
    const baseUrl = this.getBaseUrl();
    
    const response = await fetch(`${baseUrl}/organization/api/v1/signed-url/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get signed URL' }));
      throw new Error(error.message || 'Failed to get signed URL');
    }

    return response.json();
  }

  async uploadToS3(file: File, uploadUrl: string): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  }

  async uploadFile(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Step 1: Get signed URL
      onProgress?.(10);
      const signedResponse = await this.getSignedUrl({
        fileName: file.name,
        fileType: file.type,
        folder,
      });

      onProgress?.(30);

      // Step 2: Upload to S3
      await this.uploadToS3(file, signedResponse.uploadUrl);
      onProgress?.(100);

      // Return the public fileUrl
      return signedResponse.fileUrl;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }
}

export const uploadService = new UploadService();
