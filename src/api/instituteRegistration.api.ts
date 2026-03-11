/**
 * Institute Registration API
 * Uses VITE_JWT_TOKEN (Bearer token)
 * Endpoint: POST /api/institutes
 */

import { getBaseUrl } from '@/contexts/utils/auth.api';

// ============= TYPES =============

export interface CreateInstituteRequest {
  // Required
  name: string;
  code?: string;
  email: string;
  // Optional
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  district?: string;
  province?: string;
  pinCode?: string;
  shortName?: string;
  description?: string;
  websiteUrl?: string;
  // Images
  logoUrl?: string;
  loadingGifUrl?: string;
  imageUrl?: string;
  imageUrls?: string[];
  // System contact (kept for form use)
  systemContactPhoneNumber?: string;
  systemContactEmail?: string;
}

export interface CreateInstituteResponse {
  id: string;
  name: string;
  shortName: string | null;
  code: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  country: string | null;
  pinCode: string | null;
  logoUrl: string | null;
  loadingGifUrl: string | null;
  imageUrl: string | null;
  imageUrls: string[] | null;
  description: string | null;
  websiteUrl: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============= API =============

const getJwtToken = (): string => {
  return import.meta.env.VITE_JWT_TOKEN || '';
};

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getJwtToken()}`,
});

export const registerInstitute = async (
  data: CreateInstituteRequest
): Promise<CreateInstituteResponse> => {
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/institutes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400) {
      const messages = Array.isArray(errorData.errors)
        ? errorData.errors.join('. ')
        : errorData.message || 'Validation failed.';
      throw new Error(messages);
    }
    if (response.status === 401) {
      throw new Error('Unauthorized. Please contact support.');
    }
    if (response.status === 409) {
      throw new Error(errorData.message || 'Institute with this code or email already exists.');
    }
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a minute and try again.');
    }
    throw new Error(errorData.message || `Registration failed: ${response.status}`);
  }

  return response.json();
};

export const isValidSriLankanPhone = (phone: string): boolean => {
  return /^\+947[0-9]{8}$/.test(phone);
};
