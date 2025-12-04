import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Storage base URL for public image access
const STORAGE_BASE_URL = 'https://storage.suraksha.lk';

/**
 * Convert a relative path or full URL to a proper image URL
 * Handles AWS S3 URLs and converts them to the public storage URL
 */
export function getImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) return '';
  
  // Already a full URL with the correct storage domain
  if (imageUrl.startsWith(STORAGE_BASE_URL)) {
    return imageUrl;
  }
  
  // AWS S3 URL - extract the path and convert to storage URL
  if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('amazonaws.com')) {
    // Extract the relative path from AWS URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      const relativePath = urlParts.slice(bucketIndex + 1).join('/');
      return `${STORAGE_BASE_URL}/${relativePath}`;
    }
  }
  
  // Google Cloud Storage URL - convert to storage URL
  if (imageUrl.includes('storage.googleapis.com')) {
    const urlParts = imageUrl.split('/');
    const storageIndex = urlParts.findIndex(part => part.includes('storage.googleapis.com'));
    if (storageIndex !== -1 && storageIndex < urlParts.length - 2) {
      // Skip bucket name and get the path
      const relativePath = urlParts.slice(storageIndex + 2).join('/');
      return `${STORAGE_BASE_URL}/${relativePath}`;
    }
  }
  
  // Relative path - prepend storage base URL
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    // Remove leading slash if present
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${STORAGE_BASE_URL}/${cleanPath}`;
  }
  
  // Return as-is for other full URLs
  return imageUrl;
}
