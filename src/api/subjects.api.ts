import { enhancedCachedClient } from './enhancedCachedClient';

// Subject Types Enum (12 options)
export type SubjectType = 
  | 'MAIN'                      // Regular mandatory subject
  | 'BASKET'                    // Legacy basket (deprecated)
  | 'COMMON'                    // Common across all grades
  | 'GRADE_6TO9_BASKET'         // Middle school basket
  | 'GRADE_10TO11_BASKET_1'     // O/L Basket 1
  | 'GRADE_10TO11_BASKET_2'     // O/L Basket 2
  | 'GRADE_10TO11_BASKET_3'     // O/L Basket 3
  | 'GRADE_10TO11_BASKET_4'     // O/L Basket 4
  | 'GRADE_12TO13_BASKET_1'     // A/L Basket 1
  | 'GRADE_12TO13_BASKET_2'     // A/L Basket 2
  | 'GRADE_12TO13_BASKET_3'     // A/L Basket 3
  | 'GRADE_12TO13_BASKET_4';    // A/L Basket 4

// Basket Categories (6 options)
export type BasketCategory = 
  | 'LANGUAGE'     // Language subjects
  | 'ARTS'         // Arts and creative subjects
  | 'TECHNOLOGY'   // Technology subjects
  | 'COMMERCE'     // Commerce subjects
  | 'SCIENCE'      // Science subjects
  | 'RELIGION';    // Religion subjects

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  subjectType: SubjectType;
  basketCategory: BasketCategory | null;
  instituteId: string;  // NEW: Replaced instituteType
  imgUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectsResponse {
  data: Subject[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SubjectQueryParams {
  userId?: string;
  role?: string;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  isActive?: boolean;
  search?: string;
  category?: string;
  subjectType?: SubjectType;
  basketCategory?: BasketCategory;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateSubjectDto {
  code: string;
  name: string;
  description?: string;
  category?: string;
  creditHours?: number;
  isActive?: boolean;
  subjectType?: SubjectType;
  basketCategory?: BasketCategory;
  instituteId: string;  // Required
  imgUrl?: string;
}

export interface UpdateSubjectDto {
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  creditHours?: number;
  isActive?: boolean;
  subjectType?: SubjectType;
  basketCategory?: BasketCategory;
  imgUrl?: string;
}

// Subject type options for dropdowns
export const SUBJECT_TYPE_OPTIONS: { value: SubjectType; label: string; description: string }[] = [
  { value: 'MAIN', label: 'Main Subject', description: 'Regular mandatory subject' },
  { value: 'COMMON', label: 'Common Subject', description: 'Common across all grades' },
  { value: 'GRADE_6TO9_BASKET', label: 'Grade 6-9 Basket', description: 'Middle school basket subject' },
  { value: 'GRADE_10TO11_BASKET_1', label: 'O/L Basket 1', description: 'Grades 10-11 Basket 1' },
  { value: 'GRADE_10TO11_BASKET_2', label: 'O/L Basket 2', description: 'Grades 10-11 Basket 2' },
  { value: 'GRADE_10TO11_BASKET_3', label: 'O/L Basket 3', description: 'Grades 10-11 Basket 3' },
  { value: 'GRADE_10TO11_BASKET_4', label: 'O/L Basket 4', description: 'Grades 10-11 Basket 4' },
  { value: 'GRADE_12TO13_BASKET_1', label: 'A/L Basket 1', description: 'Grades 12-13 Basket 1' },
  { value: 'GRADE_12TO13_BASKET_2', label: 'A/L Basket 2', description: 'Grades 12-13 Basket 2' },
  { value: 'GRADE_12TO13_BASKET_3', label: 'A/L Basket 3', description: 'Grades 12-13 Basket 3' },
  { value: 'GRADE_12TO13_BASKET_4', label: 'A/L Basket 4', description: 'Grades 12-13 Basket 4' },
  { value: 'BASKET', label: 'Legacy Basket', description: '(Deprecated) Generic basket' },
];

// Basket category options for dropdowns
export const BASKET_CATEGORY_OPTIONS: { value: BasketCategory; label: string; description: string }[] = [
  { value: 'LANGUAGE', label: 'Language', description: 'Language subjects (English, Tamil, Sinhala, etc.)' },
  { value: 'ARTS', label: 'Arts', description: 'Arts and creative subjects (Music, Dancing, Drama, etc.)' },
  { value: 'TECHNOLOGY', label: 'Technology', description: 'Technology subjects (IT, Engineering, etc.)' },
  { value: 'COMMERCE', label: 'Commerce', description: 'Commerce subjects (Accounting, Business, Economics, etc.)' },
  { value: 'SCIENCE', label: 'Science', description: 'Science subjects (Physics, Chemistry, Biology, etc.)' },
  { value: 'RELIGION', label: 'Religion', description: 'Religion subjects (Buddhism, Christianity, etc.)' },
];

// Helper to check if subject type requires basket category
export const requiresBasketCategory = (subjectType: SubjectType | string): boolean => {
  return subjectType.includes('BASKET');
};

export const subjectsApi = {
  // Get all subjects for an institute (NEW endpoint)
  getAll: (instituteId: string, params?: SubjectQueryParams, forceRefresh = false) => {
    const queryParams: Record<string, any> = {
      instituteId,
      ...(params?.isActive !== undefined && { isActive: params.isActive }),
      ...(params?.search && { search: params.search }),
      ...(params?.category && { category: params.category }),
      ...(params?.subjectType && { subjectType: params.subjectType }),
      ...(params?.basketCategory && { basketCategory: params.basketCategory }),
      ...(params?.page && { page: params.page }),
      ...(params?.limit && { limit: params.limit }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    };

    return enhancedCachedClient.get<Subject[]>('/subjects', queryParams, {
      ttl: 20,
      forceRefresh,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  },

  // Get subjects statistics
  getStats: (instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<{ total: number; active: number; inactive: number }>(
      '/subjects/stats',
      { instituteId },
      { ttl: 20, forceRefresh, instituteId }
    );
  },

  // Get subjects by category
  getCategories: (instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<{ category: string; count: number }[]>(
      '/subjects/categories',
      { instituteId },
      { ttl: 20, forceRefresh, instituteId }
    );
  },

  // Get subject by code
  getByCode: (code: string, instituteId: string, forceRefresh = false) => {
    return enhancedCachedClient.get<Subject>(`/subjects/code/${code}`, { instituteId }, {
      ttl: 20,
      forceRefresh,
      instituteId
    });
  },

  // Get a single subject by ID
  getById: (id: string, instituteId: string, params?: SubjectQueryParams, forceRefresh = false) => {
    return enhancedCachedClient.get<Subject>(`/subjects/${id}`, { instituteId }, {
      ttl: 20,
      forceRefresh,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: id,
      role: params?.role
    });
  },

  // Create a new subject (JSON body)
  create: async (data: CreateSubjectDto): Promise<Subject> => {
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_LMS_BASE_URL || 'https://lmsapi.suraksha.lk';
    
    const response = await fetch(`${baseUrl}/subjects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create subject');
    }

    return response.json();
  },

  // Update a subject
  update: (id: string, data: UpdateSubjectDto, instituteId?: string) => {
    return enhancedCachedClient.patch<Subject>(`/subjects/${id}`, data, {
      instituteId,
      subjectId: id
    });
  },

  // Soft delete (deactivate) a subject
  deactivate: (id: string, instituteId?: string) => {
    return enhancedCachedClient.patch<Subject>(`/subjects/${id}/deactivate`, {}, {
      instituteId,
      subjectId: id
    });
  },

  // Permanent delete a subject (SUPERADMIN only)
  delete: (id: string, instituteId?: string) => {
    return enhancedCachedClient.delete<void>(`/subjects/${id}`, {
      instituteId,
      subjectId: id
    });
  },

  // Check if subjects are cached
  hasCache: (instituteId: string, params?: SubjectQueryParams) => {
    return enhancedCachedClient.hasCache('/subjects', { instituteId }, {
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  },

  // Get cached subjects
  getCached: (instituteId: string, params?: SubjectQueryParams) => {
    return enhancedCachedClient.getCachedOnly<Subject[]>('/subjects', { instituteId }, {
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      subjectId: params?.subjectId,
      role: params?.role
    });
  },

  // Preload subjects
  preload: async (instituteId: string, params?: SubjectQueryParams) => {
    await subjectsApi.getAll(instituteId, params);
  }
};
