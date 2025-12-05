// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Check if date of birth results in age >= minAge years
 */
export const validateMinAge = (dateOfBirth: string, minAge: number): ValidationResult => {
  if (!dateOfBirth) {
    return { isValid: false, error: `Date of birth is required` };
  }

  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < minAge) {
    return { isValid: false, error: `Must be at least ${minAge} years old` };
  }

  return { isValid: true };
};

/**
 * Check if date is not in the future
 */
export const validateNotFutureDate = (dateOfBirth: string): ValidationResult => {
  if (!dateOfBirth) {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  const birthDate = new Date(dateOfBirth);

  if (isNaN(birthDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (birthDate > today) {
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  return { isValid: true };
};

/**
 * Validate required string field
 */
export const validateRequired = (value: string | undefined | null, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 60) {
    return { isValid: false, error: 'Email must be less than 60 characters' };
  }

  return { isValid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone === '+94' || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic validation for Sri Lankan numbers
  const cleanPhone = phone.replace(/\s/g, '');
  if (cleanPhone.length < 10) {
    return { isValid: false, error: 'Phone number is too short' };
  }

  return { isValid: true };
};

/**
 * Validate string length
 */
export const validateLength = (value: string, fieldName: string, min: number, max: number): ValidationResult => {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }

  if (value.length > max) {
    return { isValid: false, error: `${fieldName} must be less than ${max} characters` };
  }

  return { isValid: true };
};

/**
 * Validate postal code (Sri Lankan format - 5 digits)
 */
export const validatePostalCode = (postalCode: string): ValidationResult => {
  if (!postalCode) {
    return { isValid: true }; // Optional field
  }

  if (!/^[0-9]{5}$/.test(postalCode)) {
    return { isValid: false, error: 'Postal code must be exactly 5 digits' };
  }

  return { isValid: true };
};

/**
 * Validate birth certificate number
 */
export const validateBirthCertificate = (bcNo: string): ValidationResult => {
  if (!bcNo || bcNo.trim() === '') {
    return { isValid: false, error: 'Birth certificate number is required' };
  }

  if (bcNo.length > 50) {
    return { isValid: false, error: 'Birth certificate number must be less than 50 characters' };
  }

  return { isValid: true };
};

// Language options for the form
export const LANGUAGE_OPTIONS = [
  { value: 'E', label: 'English', fullLabel: 'English' },
  { value: 'S', label: 'සිංහල', fullLabel: 'Sinhala' },
  { value: 'T', label: 'தமிழ்', fullLabel: 'Tamil' }
] as const;

export type LanguageCode = 'E' | 'S' | 'T';

// Gender options
export const GENDER_OPTIONS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
} as const;

export type GenderCode = 'MALE' | 'FEMALE' | 'OTHER';

// Blood group options
export const BLOOD_GROUP_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
] as const;

export type BloodGroupCode = typeof BLOOD_GROUP_OPTIONS[number];
