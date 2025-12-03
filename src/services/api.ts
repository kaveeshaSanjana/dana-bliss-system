import { useUserRole } from '@/hooks/useUserRole';

// Get API base URL from store
const getBaseUrl = () => {
  const state = useUserRole.getState();
  return state.backendUrl || 'http://localhost:8080';
};

// Get auth token from Zustand store
const getAuthToken = () => {
  const state = useUserRole.getState();
  return state.accessToken;
};

// Common headers for API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
});

// Organizations API
export const getEnrolledOrganizations = async (page = 1, limit = 100) => {
  const response = await fetch(
    `${getBaseUrl()}/organization/api/v1/organizations/user/enrolled?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch organizations');
  return response.json();
};

export const getNotEnrolledOrganizations = async (page = 1, limit = 10) => {
  const response = await fetch(
    `${getBaseUrl()}/organization/api/v1/organizations/user/not-enrolled?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch not-enrolled organizations');
  return response.json();
};

// Courses (Causes) API
export const getOrganizationCourses = async (organizationId: string, page = 1, limit = 10) => {
  const response = await fetch(
    `${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/causes?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
};

// Members API
export const getOrganizationMembers = async (organizationId: string) => {
  const response = await fetch(
    `${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/management/members`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch members');
  return response.json();
};

export const getUnverifiedMembers = async (organizationId: string, page = 1, limit = 10) => {
  const response = await fetch(
    `${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/members/unverified?page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch unverified members');
  return response.json();
};

// Lectures API
export const getLectures = async (causeId: string, page = 1, limit = 10) => {
  const response = await fetch(
    `${getBaseUrl()}/organization/api/v1/lectures?causeId=${causeId}&page=${page}&limit=${limit}`,
    { headers: getHeaders() }
  );
  if (!response.ok) throw new Error('Failed to fetch lectures');
  return response.json();
};

// Parents API
export const createParent = async (parentData: any) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/parents`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(parentData),
  });
  if (!response.ok) throw new Error('Failed to create parent');
  return response.json();
};

// Create lecture with documents API (JSON body with S3 URLs)
export interface LectureDocument {
  title: string;
  description?: string;
  docUrl: string;
}

export interface CreateLectureData {
  title: string;
  description: string;
  content?: string;
  venue?: string;
  mode?: string;
  timeStart: string;
  timeEnd: string;
  liveLink?: string;
  liveMode?: string;
  recordingUrl?: string;
  isPublic: boolean;
  documents?: LectureDocument[];
}

export const createLectureWithDocuments = async (causeId: string, data: CreateLectureData) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/lectures/with-documents/${causeId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create lecture');
  return response.json();
};

// Update lecture with documents API (JSON body with S3 URLs)
export const updateLectureWithDocuments = async (lectureId: string, data: Partial<CreateLectureData>) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/lectures/${lectureId}/with-documents`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update lecture');
  return response.json();
};

// Create course with image API (accepts JSON with imageUrl after S3 upload)
export const createCourseWithImage = async (courseData: {
  title: string;
  description?: string;
  organizationId: string;
  isPublic: boolean;
  introVideoUrl?: string;
  imageUrl?: string;
}) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/causes/with-image`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(courseData),
  });
  if (!response.ok) throw new Error('Failed to create course');
  return response.json();
};

// Verify member API
export const verifyMember = async (organizationId: string, userId: string, isVerified: boolean) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/verify`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ userId, isVerified }),
  });
  if (!response.ok) throw new Error('Failed to verify member');
  return response.json();
};

// Remove user from organization API
export const removeUserFromOrganization = async (organizationId: string, userId: string) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/management/remove-user`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Failed to remove user');
  return response.json();
};

// Change user role API
export const changeUserRole = async (organizationId: string, userId: string, newRole: string) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/management/change-role`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ userId, newRole }),
  });
  if (!response.ok) throw new Error('Failed to change user role');
  return response.json();
};

// Transfer presidency API
export const transferPresidency = async (organizationId: string, newPresidentUserId: string) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/organizations/${organizationId}/management/transfer-presidency`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ newPresidentUserId }),
  });
  if (!response.ok) throw new Error('Failed to transfer presidency');
  return response.json();
};

// Enroll in organization API
export const enrollInOrganization = async (organizationId: string, enrollmentKey: string) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/organizations/enroll`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ organizationId, enrollmentKey }),
  });
  if (!response.ok) throw new Error('Failed to enroll in organization');
  return response.json();
};

// Auth API
export const login = async (email: string, password: string) => {
  const response = await fetch(`${getBaseUrl()}/organization/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};
