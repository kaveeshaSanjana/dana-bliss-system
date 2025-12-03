import { useState } from 'react';
import { uploadService } from '@/services/uploadService';

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    folder: string
  ): Promise<string> => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const fileUrl = await uploadService.uploadFile(
        file,
        folder,
        (p) => setProgress(p)
      );

      return fileUrl;
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
