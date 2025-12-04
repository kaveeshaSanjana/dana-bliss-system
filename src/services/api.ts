const getBaseUrl = () => localStorage.getItem('api_base_url') || 'https://lms-923357517997.europe-west1.run.app';
const getSecondBUrl = () => localStorage.getItem('api_second_base_url') || 'https://laas-backend-02-923357517997.europe-west1.run.app';
const getThirdBaseUrl = () => localStorage.getItem('api_third_base_url') || 'http://localhost:3002';

// Helper function to detect folder type from file
const detectFolderType = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const documentExts = ['pdf', 'doc', 'docx'];
  
  if (imageExts.includes(ext)) {
    return 'institute-images';
  } else if (documentExts.includes(ext)) {
    return 'correction-files';
  }
  return 'institute-images';
};

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    accessStructure: any;
  };
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  nic?: string;
  birthCertificateNo?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  idUrl?: string;
  isActive?: boolean;
}

interface CreateStudentRequest {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    dateOfBirth?: string;
    gender?: string;
    nic?: string;
    birthCertificateNo?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    isActive: boolean;
  };
  fatherId: string;
  motherId: string;
  guardianId: string;
  studentId: string;
  emergencyContact: string;
  medicalConditions?: string;
  allergies?: string;
  bloodGroup?: string;
  isActive: boolean;
}

interface CreateInstituteRequest {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  imageUrl?: string;
}

interface CreateSubjectRequest {
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  basketCategory: string;
  instituteId: string;
}

// AWS S3 Signed URL Response
interface SignedUrlResponse {
  success: boolean;
  message: string;
  uploadUrl: string;
  publicUrl: string;
  relativePath: string;
  fields: Record<string, string>;
  instructions?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
}

// Storage base URL for public access
const STORAGE_BASE_URL = 'https://storage.suraksha.lk';

// Helper to get public URL from relative path
const getPublicUrl = (relativePath: string): string => {
  return `${STORAGE_BASE_URL}/${relativePath}`;
};

class ApiService {
  private static getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Generate signed URL for file upload (AWS S3)
  static async generateSignedUrl(folder: string, file: File): Promise<SignedUrlResponse> {
    const params = new URLSearchParams({
      folder,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size.toString(),
    });

    const response = await fetch(`${getBaseUrl()}/upload/get-signed-url?${params}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate signed URL');
    }

    return await response.json();
  }

  // Upload file to S3 using POST with FormData
  static async uploadToS3(uploadUrl: string, fields: Record<string, string>, file: File): Promise<void> {
    const formData = new FormData();
    
    // IMPORTANT: Add all fields from backend BEFORE the file
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key]);
    });
    
    // Add file LAST
    formData.append('file', file);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type header - browser handles it automatically
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`S3 upload failed: ${errorText}`);
    }
  }

  // Verify and make file public after S3 upload
  static async verifyAndPublish(relativePath: string): Promise<{ success: boolean; publicUrl: string; fileDetails?: any }> {
    const response = await fetch(`${getBaseUrl()}/upload/verify-and-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ relativePath }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify upload');
    }

    return await response.json();
  }

  // Helper to upload file and get relative path (AWS S3 flow)
  static async uploadFile(folder: string, file: File): Promise<string> {
    // Step 1: Get signed URL
    const signedUrlResponse = await this.generateSignedUrl(folder, file);
    
    // Step 2: Upload to S3
    await this.uploadToS3(
      signedUrlResponse.uploadUrl,
      signedUrlResponse.fields,
      file
    );
    
    // Step 3: Verify and publish
    await this.verifyAndPublish(signedUrlResponse.relativePath);
    
    return signedUrlResponse.relativePath;
  }

  // Get public URL from relative path
  static getPublicUrl(relativePath: string): string {
    return getPublicUrl(relativePath);
  }

  // Get signed URL for advertisement media upload (AWS S3)
  static async getAdvertisementSignedUrl(contentType: string, advertisementId: string, fileName: string, fileSize: number): Promise<SignedUrlResponse> {
    const params = new URLSearchParams({
      folder: 'advertisements',
      fileName,
      contentType,
      fileSize: fileSize.toString(),
    });

    const candidates = Array.from(
      new Set([
        getSecondBUrl(),
        'https://laas-backend-02-923357517997.europe-west1.run.app',
      ])
    );

    for (const base of candidates) {
      try {
        const response = await fetch(`${base}/upload/get-signed-url?${params}`, {
          method: 'GET',
          headers: {
            ...this.getAuthHeader(),
          },
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (_) {
        // try next candidate
      }
    }
    throw new Error('Failed to get signed URL for advertisement');
  }

  // Upload advertisement file using AWS S3 POST
  static async uploadAdvertisementFile(file: File, advertisementId: string): Promise<{ relativePath: string; publicUrl: string }> {
    // Step 1: Get signed URL
    const signedUrlData = await this.getAdvertisementSignedUrl(file.type, advertisementId, file.name, file.size);
    
    // Step 2: Upload to S3 using POST with FormData
    await this.uploadToS3(signedUrlData.uploadUrl, signedUrlData.fields, file);
    
    // Step 3: Verify and publish
    await this.verifyAndPublish(signedUrlData.relativePath);
    
    // Step 4: Return relative path and public URL
    return {
      relativePath: signedUrlData.relativePath,
      publicUrl: getPublicUrl(signedUrlData.relativePath)
    };
  }

  // Get signed URL for lecture file upload (AWS S3)
  static async getLectureSignedUrl(lectureId: string, documentType: 'cover' | 'document', contentType: string, fileName: string, fileSize: number): Promise<SignedUrlResponse> {
    const folder = documentType === 'cover' ? 'lecture-covers' : 'lecture-documents';
    const params = new URLSearchParams({
      folder,
      fileName,
      contentType,
      fileSize: fileSize.toString(),
    });

    const response = await fetch(`https://laas-backend-02-923357517997.europe-west1.run.app/upload/get-signed-url?${params}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get signed URL for lecture');
    }

    return response.json();
  }

  // Upload lecture file using AWS S3 POST
  static async uploadLectureFile(file: File, lectureId: string, documentType: 'cover' | 'document'): Promise<{ relativePath: string; publicUrl: string }> {
    // Step 1: Get signed URL
    const signedUrlData = await this.getLectureSignedUrl(lectureId, documentType, file.type, file.name, file.size);
    
    // Step 2: Upload to S3 using POST with FormData
    await this.uploadToS3(signedUrlData.uploadUrl, signedUrlData.fields, file);
    
    // Step 3: Verify and publish
    await this.verifyAndPublish(signedUrlData.relativePath);
    
    // Step 4: Return relative path and public URL
    return {
      relativePath: signedUrlData.relativePath,
      publicUrl: getPublicUrl(signedUrlData.relativePath)
    };
  }

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${getBaseUrl()}/v2/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  static async getUsers(page = 1, limit = 10, isActive = true): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/users?page=${page}&limit=${limit}&isActive=${isActive}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  }


  static async getInstitutes(page = 1, limit = 10, search?: string, instituteType?: string, isActive?: boolean): Promise<ApiResponse<any[]>> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString()
    };

    // Only add parameters if they have meaningful values
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (instituteType && instituteType.trim()) {
      params.instituteType = instituteType.trim();
    }
    if (isActive !== undefined) {
      params.isActive = isActive.toString();
    }

    const queryParams = new URLSearchParams(params);

    const response = await fetch(`${getBaseUrl()}/institutes?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch institutes');
    }

    return await response.json();
  }

  static async getSubjects(): Promise<any[]> {
    const response = await fetch(`${getBaseUrl()}/subjects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }

    return await response.json();
  }

  static async createSubject(subjectData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      throw new Error('Failed to create subject');
    }

    return await response.json();
  }

  static async createInstitute(instituteData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institutes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(instituteData),
    });

    if (!response.ok) {
      throw new Error('Failed to create institute');
    }

    return await response.json();
  }

  static async updateInstitute(instituteId: string, instituteData: FormData): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institutes/${instituteId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
      },
      body: instituteData,
    });

    if (!response.ok) {
      throw new Error('Failed to update institute');
    }

    return await response.json();
  }

  static async getPayments(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/payment?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    const data = await response.json();
    return {
      data: data.payments || [],
      meta: {
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
        hasPreviousPage: (data.page || 1) > 1,
        hasNextPage: (data.page || 1) < Math.ceil((data.total || 0) / (data.limit || 10)),
        previousPage: (data.page || 1) > 1 ? (data.page || 1) - 1 : null,
        nextPage: (data.page || 1) < Math.ceil((data.total || 0) / (data.limit || 10)) ? (data.page || 1) + 1 : null,
      }
    };
  }

  static async verifyPayment(paymentId: string, verificationData: {
    status?: string;
    subscriptionPlan?: string;
    paymentValidityDays?: number;
    rejectionReason?: string;
    notes?: string;
  }): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/payment/${paymentId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(verificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return await response.json();
  }

  static async assignUserById(instituteId: string, assignmentData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-users/institute/${instituteId}/assign-user-by-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign user by ID');
    }

    return await response.json();
  }

  static async assignUserByPhone(instituteId: string, assignmentData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-users/institute/${instituteId}/assign-user-by-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign user by phone');
    }

    return await response.json();
  }

  static async assignStudentByRfid(instituteId: string, assignmentData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-users/institute/${instituteId}/assign-student-by-rfid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign student by RFID');
    }

    return await response.json();
  }

  static async assignUserByEmail(instituteId: string, assignmentData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-users/institute/${instituteId}/assign-user-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign user by email');
    }

    return await response.json();
  }

  static async getUserBasicById(userId: string): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users/basic/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user basic info');
    }

    return await response.json();
  }

  static async getUserBasicByPhone(phoneNumber: string): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users/basic/phone/${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user basic info by phone');
    }

    return await response.json();
  }

  static async getUserBasicByEmail(email: string): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users/basic/email/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user basic info by email');
    }

    return await response.json();
  }

  static async getLectures(page?: number, recordsPerPage?: number): Promise<any> {
    const url = `${getSecondBUrl()}/api/structured-lectures`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lectures');
    }

    return await response.json();
  }

  static async createLecture(data: any): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/structured-lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create lecture');
    }

    return await response.json();
  }

  static async updateLecture(lectureId: string, data: any): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/structured-lectures/${lectureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update lecture');
    }

    return await response.json();
  }

  static async getTransport(): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/bookhires/admin/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transport data');
    }

    return await response.json();
  }

  static async verifyTransport(transportId: number): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/bookhires/admin/${transportId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify transport');
    }

    return await response.json();
  }

  static async rejectTransport(transportId: number): Promise<any> {
    const response = await fetch(`${getSecondBUrl()}/api/bookhires/admin/${transportId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reject transport');
    }

    return await response.json();
  }

  static async assignRfid(assignData: {
    userId: string;
    userRfid: string;
  }): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users/register-rfid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(assignData),
    });

    if (!response.ok) {
      throw new Error('Failed to assign RFID');
    }

    return await response.json();
  }

  static async getAdvertisements(page = 1, limit = 10): Promise<{ success: boolean; data: any[] }> {
    const response = await fetch(`${getSecondBUrl()}/api/advertisements?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch advertisements');
    }

    const result = await response.json();
    
    // Transform the response to match expected format
    return {
      success: true,
      data: result.advertisements || []
    };
  }

  static async createAdvertisement(advertisementData: any): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await fetch(`${getSecondBUrl()}/api/advertisements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(advertisementData),
    });

    if (!response.ok) {
      throw new Error('Failed to create advertisement');
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Advertisement created successfully',
      data: data
    };
  }

  static async createSenderMask(maskData: {
    maskId: string;
    displayName: string;
    phoneNumber: string;
    instituteId: string;
    isActive: boolean;
  }): Promise<{ success: boolean; message: string; mask?: any; instituteId?: string }> {
    const response = await fetch(`${getBaseUrl()}/sms/sender-masks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(maskData),
    });

    if (!response.ok) {
      throw new Error('Failed to create sender mask');
    }

    return await response.json();
  }

  static async createComprehensiveUser(userData: any): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/users/comprehensive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return await response.json();
  }

  // Organization Management
  static async getOrganizations(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${getBaseUrl()}/organizations?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    return await response.json();
  }

  static async createOrganization(formData: FormData): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/organizations`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create organization');
    }

    return await response.json();
  }

  // Upload organization image using AWS S3
  static async uploadOrganizationImageS3(organizationId: string, file: File): Promise<{ relativePath: string; publicUrl: string }> {
    // Step 1: Get signed URL
    const signedUrlResponse = await this.generateSignedUrl('organization-images', file);
    
    // Step 2: Upload to S3
    await this.uploadToS3(signedUrlResponse.uploadUrl, signedUrlResponse.fields, file);
    
    // Step 3: Verify and publish
    await this.verifyAndPublish(signedUrlResponse.relativePath);
    
    // Step 4: Update organization with the new image URL
    const response = await fetch(`${getBaseUrl()}/organizations/${organizationId}/update-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ imageUrl: signedUrlResponse.relativePath }),
    });

    if (!response.ok) {
      throw new Error('Failed to update organization image');
    }

    return {
      relativePath: signedUrlResponse.relativePath,
      publicUrl: getPublicUrl(signedUrlResponse.relativePath)
    };
  }

  // Legacy method for backward compatibility
  static async uploadOrganizationImage(organizationId: string, formData: FormData): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/organizations/${organizationId}/upload-image`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload organization image');
    }

    return await response.json();
  }

  // Class Management
  static async getClasses(page = 1, limit = 10, instituteId?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (instituteId) params.append('instituteId', instituteId);

    const response = await fetch(`${getBaseUrl()}/institute-classes?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }

    return await response.json();
  }

  static async createClass(formData: FormData): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-classes`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create class');
    }

    return await response.json();
  }

  // Upload class image using AWS S3
  static async uploadClassImageS3(classId: string, file: File): Promise<{ relativePath: string; publicUrl: string }> {
    // Step 1: Get signed URL
    const signedUrlResponse = await this.generateSignedUrl('class-images', file);
    
    // Step 2: Upload to S3
    await this.uploadToS3(signedUrlResponse.uploadUrl, signedUrlResponse.fields, file);
    
    // Step 3: Verify and publish
    await this.verifyAndPublish(signedUrlResponse.relativePath);
    
    // Step 4: Update class with the new image URL
    const response = await fetch(`${getBaseUrl()}/institute-classes/${classId}/update-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ imageUrl: signedUrlResponse.relativePath }),
    });

    if (!response.ok) {
      throw new Error('Failed to update class image');
    }

    return {
      relativePath: signedUrlResponse.relativePath,
      publicUrl: getPublicUrl(signedUrlResponse.relativePath)
    };
  }

  // Legacy method for backward compatibility
  static async uploadClassImage(classId: string, formData: FormData): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/institute-classes/${classId}/upload-image`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload class image');
    }

    return await response.json();
  }

  // Upload student image using AWS S3
  static async uploadStudentImageS3(userId: string, file: File): Promise<{ relativePath: string; publicUrl: string }> {
    // Step 1: Get signed URL
    const signedUrlResponse = await this.generateSignedUrl('student-images', file);
    
    // Step 2: Upload to S3
    await this.uploadToS3(signedUrlResponse.uploadUrl, signedUrlResponse.fields, file);
    
    // Step 3: Verify and publish
    await this.verifyAndPublish(signedUrlResponse.relativePath);
    
    // Step 4: Update student with the new image URL
    const response = await fetch(`${getBaseUrl()}/students/${userId}/update-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ imageUrl: signedUrlResponse.relativePath }),
    });

    if (!response.ok) {
      throw new Error('Failed to update student image');
    }

    return {
      relativePath: signedUrlResponse.relativePath,
      publicUrl: getPublicUrl(signedUrlResponse.relativePath)
    };
  }

  // Legacy method for backward compatibility
  static async uploadStudentImage(userId: string, formData: FormData): Promise<any> {
    const response = await fetch(`${getBaseUrl()}/students/${userId}/upload-image`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload student image');
    }

    return await response.json();
  }

  // Organization Login
  static async organizationLogin(credentials: { email: string; password: string }): Promise<any> {
    const response = await fetch(`${getThirdBaseUrl()}/organization/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Organization login failed');
    }

    const data = await response.json();
    localStorage.setItem('org_access_token', data.accessToken);
    localStorage.setItem('org_refresh_token', data.refreshToken);
    localStorage.setItem('org_user', JSON.stringify(data.user));
    return data;
  }

  static getOrganizationUser() {
    const orgUser = localStorage.getItem('org_user');
    return orgUser ? JSON.parse(orgUser) : null;
  }

  static isOrganizationAuthenticated(): boolean {
    return !!localStorage.getItem('org_access_token');
  }

  static organizationLogout() {
    localStorage.removeItem('org_access_token');
    localStorage.removeItem('org_refresh_token');
    localStorage.removeItem('org_user');
  }

  static logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.organizationLogout();
  }

  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

export default ApiService;
export { getSecondBUrl, getThirdBaseUrl, getPublicUrl, STORAGE_BASE_URL };
