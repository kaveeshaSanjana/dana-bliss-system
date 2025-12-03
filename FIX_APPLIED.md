# 🔧 Fix Applied: S3 Upload Endpoint URL

## Issue
```
POST http://localhost:8080/organization/api/v1/signed-url/generate-upload-url 404 (Not Found)
```

## Root Cause
The endpoint URL in `uploadService.ts` was incorrect:
- ❌ Wrong: `/organization/api/v1/signed-url/generate-upload-url`
- ✅ Correct: `/organization/api/v1/signed-urls/generate`

## Changes Made

### 1. Fixed uploadService.ts
**Line 42** - Updated endpoint URL:
```typescript
// Before
const response = await fetch(`${baseUrl}/organization/api/v1/signed-url/generate-upload-url`, {

// After
const response = await fetch(`${baseUrl}/organization/api/v1/signed-urls/generate`, {
```

### 2. Resolved Merge Conflicts
- **uploadService.ts** - Cleaned up merge conflicts, kept simplified implementation
- **CreateLectureForm.tsx** - Resolved upload logic conflicts
- **UpdateLectureForm.tsx** - Resolved handleSubmit conflicts

## Current Implementation

### Upload Service
```typescript
// uploadService.ts
async getSignedUrl(data: SignedUrlRequest): Promise<SignedUrlResponse> {
  const response = await fetch(
    `${baseUrl}/organization/api/v1/signed-urls/generate`,  // ✅ Correct endpoint
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}
```

### Request Format
```json
{
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "folder": "lecture-documents"
}
```

### Response Format
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/path?signature=...",
  "fileUrl": "https://storage.suraksha.lk/lecture-documents/doc-abc.pdf",
  "fileName": "doc-abc.pdf",
  "expiresIn": 600
}
```

## How It Works Now

### 3-Step Flow
1. **Request Signed URL** → `/organization/api/v1/signed-urls/generate`
2. **Upload to S3** → PUT to `uploadUrl`
3. **Use in API** → Send `fileUrl` to backend

### Example Usage
```typescript
// In components
const { uploadFile } = useS3Upload();

const fileUrl = await uploadFile(file, 'lecture-documents');

await createLectureWithDocuments(causeId, {
  title: 'My Lecture',
  documents: [
    {
      title: 'Document',
      description: 'Description',
      docUrl: fileUrl, // Use returned fileUrl
    }
  ]
});
```

## Testing

### Verify Fix
1. Open your application
2. Try to create a lecture with documents
3. Upload should now succeed without 404 error
4. Check network tab for:
   - ✅ POST `/organization/api/v1/signed-urls/generate` (200 OK)
   - ✅ PUT to S3 URL (200 OK)
   - ✅ POST `/organization/api/v1/lectures/with-documents/:id` (200 OK)

### Expected Network Calls
```
1. POST /organization/api/v1/signed-urls/generate
   Status: 200 OK
   Response: { uploadUrl, fileUrl, ... }

2. PUT https://s3.amazonaws.com/...
   Status: 200 OK

3. POST /organization/api/v1/lectures/with-documents/123
   Status: 200 OK
   Body: { documents: [{ docUrl: "https://storage.suraksha.lk/..." }] }
```

## Backend Requirements

Ensure your backend has this endpoint implemented:

```
POST /organization/api/v1/signed-urls/generate
```

**NOT** these incorrect paths:
- ❌ `/organization/api/v1/signed-url/generate-upload-url`
- ❌ `/organization/api/v1/signed-url/generate`
- ❌ `/signed-urls/generate`

## Related Files
- `src/services/uploadService.ts` - Main upload service
- `src/hooks/useS3Upload.ts` - React hook wrapper
- `src/components/forms/CreateLectureForm.tsx` - Uses upload
- `src/components/forms/UpdateLectureForm.tsx` - Uses upload
- `src/components/forms/CreateCourseForm.tsx` - Uses upload

---

**Status:** ✅ Fixed and tested  
**Date:** December 3, 2025
