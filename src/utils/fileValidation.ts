import type { FileConstraints, FileValidationResult } from '../types/upload';

export const FILE_CONSTRAINTS: Record<string, FileConstraints> = {
  PROFILE_IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  INSTITUTE_IMAGE: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  ORGANIZATION_IMAGE: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  CAUSE_IMAGE: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  LECTURE_DOCUMENT: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'audio/mpeg',
      'text/plain'
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.mp4', '.mp3', '.txt']
  }
};

export const validateFile = (file: File, constraints: FileConstraints): FileValidationResult => {
  const errors: string[] = [];

  // Check file size
  if (file.size > constraints.maxSize) {
    errors.push(`File size must be less than ${(constraints.maxSize / (1024 * 1024)).toFixed(0)}MB`);
  }

  // Check file type
  if (!constraints.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!constraints.allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }

  // Check for double extensions (security)
  const parts = file.name.split('.');
  if (parts.length > 2) {
    errors.push('Files with multiple extensions are not allowed');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const handleUploadError = (error: Error) => {
  if (error.message.includes('size exceeds')) {
    return {
      title: 'File Too Large',
      message: error.message,
      type: 'warning' as const
    };
  }

  if (error.message.includes('Invalid file type')) {
    return {
      title: 'Invalid File',
      message: error.message,
      type: 'warning' as const
    };
  }

  if (error.message.includes('S3 upload failed')) {
    return {
      title: 'Upload Failed',
      message: 'Failed to upload file to storage. Please try again.',
      type: 'error' as const
    };
  }

  if (error.message.includes('verification failed')) {
    return {
      title: 'Verification Failed',
      message: 'File uploaded but verification failed. Please contact support.',
      type: 'error' as const
    };
  }

  return {
    title: 'Upload Error',
    message: 'An unexpected error occurred. Please try again.',
    type: 'error' as const
  };
};
