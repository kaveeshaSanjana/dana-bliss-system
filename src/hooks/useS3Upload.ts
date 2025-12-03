import { useState } from 'react';
import { uploadService } from '@/services/uploadService';
import type { SignedUrlRequest, VerifyUploadResponse } from '@/types/upload';

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    endpoint: string,
    requestData: SignedUrlRequest
  ): Promise<VerifyUploadResponse> => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const result = await uploadService.uploadFile(
        file,
        endpoint,
        requestData,
        (p) => setProgress(p)
      );

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return { uploadFile, uploading, progress, error, reset };
};
