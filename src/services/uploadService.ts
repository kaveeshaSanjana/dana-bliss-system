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

<<<<<<< HEAD
  /**
   * Step 1: Request signed upload URL from backend
   * Use specific endpoints like /signed-urls/lecture or generic /signed-urls/generate
   */
  async getSignedUrl(
    endpoint: string,
    data: SignedUrlRequest
  ): Promise<SignedUrlResponse> {
=======
  async getSignedUrl(data: SignedUrlRequest): Promise<SignedUrlResponse> {
>>>>>>> 98b153f90a29b5b5c4872851fa242389a485ab27
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

<<<<<<< HEAD
  /**
   * Step 2: Upload file directly to S3 using PUT method
   * IMPORTANT: Use uploadUrl (not publicUrl) and send raw file with correct Content-Type
   */
  async uploadToS3(
    file: File,
    uploadUrl: string,
    contentType?: string
  ): Promise<void> {
=======
  async uploadToS3(file: File, uploadUrl: string): Promise<void> {
>>>>>>> 98b153f90a29b5b5c4872851fa242389a485ab27
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
<<<<<<< HEAD
        'Content-Type': contentType || file.type,
=======
        'Content-Type': file.type,
>>>>>>> 98b153f90a29b5b5c4872851fa242389a485ab27
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  }

<<<<<<< HEAD
  /**
   * Complete 3-step upload flow:
   * 1. Request signed URL
   * 2. Upload to S3
   * 3. Return publicUrl for use in API calls
   */
=======
>>>>>>> 98b153f90a29b5b5c4872851fa242389a485ab27
  async uploadFile(
    file: File,
    folder: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Step 1: Get signed URL
      onProgress?.(10);
<<<<<<< HEAD
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
=======
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
>>>>>>> 98b153f90a29b5b5c4872851fa242389a485ab27
    } catch (error) {
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }
}

export const uploadService = new UploadService();
