# Frontend File Upload Guide - S3 Signed URL Flow

## Overview
All file uploads in this system use **AWS S3 signed URLs**. Files are uploaded directly from the frontend to S3, then the returned URLs are sent to the backend API endpoints.

**❌ DO NOT** send files as `multipart/form-data` to lecture/cause endpoints  
**✅ DO** use the 3-step signed URL flow below

---

## 3-Step Upload Flow

### Step 1: Request Signed Upload URL

#### Option A: Use Specific Endpoint (Recommended)

**Endpoint:** `POST /organization/api/v1/signed-urls/lecture`  
**Auth:** Required (Bearer token)  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "lectureId": "123",
  "fileExtension": ".pdf",
  "documentType": "document"
}
```

**Other Specific Endpoints:**
- `POST /organization/api/v1/signed-urls/lecture` - For lecture documents
- `POST /organization/api/v1/signed-urls/cause` - For cause images
- `POST /organization/api/v1/signed-urls/profile` - For profile images
- `POST /organization/api/v1/signed-urls/organization` - For organization images
- `POST /organization/api/v1/signed-urls/institute` - For institute images

#### Option B: Generic Endpoint (Advanced)

**Endpoint:** `POST /organization/api/v1/signed-urls/generate`  
**Auth:** Required (Bearer token)  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "folder": "lecture-documents",
  "fileName": "my-lecture-doc.pdf",
  "contentType": "application/pdf",
  "maxSizeBytes": 10485760
}
```

**Available Folders:**
- `"cause-images"` - For cause/organization images
- `"lecture-documents"` - For lecture PDFs and documents
- `"lecture-covers"` - For lecture cover images
- `"profile-images"` - For user profile pictures
- `"organization-images"` - For organization images
- `"institute-images"` - For institute images
- `"id-documents"` - For ID verification documents

**Response (Both Options):**
```json
{
  "uploadUrl": "https://storage.suraksha.lk/lecture-documents/doc-abc123.pdf?X-Amz-Algorithm=...",
  "publicUrl": "https://storage.suraksha.lk/lecture-documents/doc-abc123.pdf",
  "uploadToken": "token_abc123",
  "expiresIn": 600
}
```

**Important:** Use `publicUrl` (not uploadUrl) for step 3!

---

### Step 2: Upload File to S3

**Endpoint:** Use `uploadUrl` from Step 1  
**Method:** `PUT`  
**Content-Type:** Match the file type (e.g., `application/pdf`, `image/jpeg`)  
**Body:** Raw file binary data

**Example (JavaScript):**
```javascript
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: fileBlob,
  headers: {
    'Content-Type': 'application/pdf', // Must match file type
  },
});

if (response.ok) {
  console.log('File uploaded successfully');
}
```

---

### Step 3: Send File URL to Backend

Now use the `publicUrl` from Step 1 in your API requests.

#### **Example: Create Lecture with Documents**

**Endpoint:** `POST /organization/api/v1/lectures/with-documents/:causeId`  
**Auth:** Required (Bearer token)  
**Content-Type:** `application/json` ← **Important: JSON, not multipart!**

**Request Body:**
```json
{
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "content": "Full lecture content here...",
  "venue": "Online",
  "mode": "virtual",
  "timeStart": "2025-12-10T10:00:00Z",
  "timeEnd": "2025-12-10T12:00:00Z",
  "isPublic": true,
  "documents": [
    {
      "title": "Lecture Slides",
      "description": "Introduction slides",
      "docUrl": "https://storage.suraksha.lk/lecture-documents/doc-abc123.pdf"
    }
  ]
}
```

---

## Implementation in This Project

### Services

#### uploadService.ts
The main upload service handles all S3 upload operations:

```typescript
import { uploadService } from '@/services/uploadService';

// Upload a file and get the public URL
const result = await uploadService.uploadFile(
  file,
  '/organization/api/v1/signed-urls/lecture',
  {
    lectureId: '123',
    fileExtension: '.pdf',
    documentType: 'document',
    contentType: file.type,
  },
  (progress) => console.log(`Upload progress: ${progress}%`)
);

console.log('Public URL:', result.publicUrl);
```

#### api.ts
API functions for creating/updating lectures with documents:

```typescript
import { createLectureWithDocuments } from '@/services/api';

// Create lecture with document URLs (NOT FormData!)
await createLectureWithDocuments(causeId, {
  title: 'My Lecture',
  description: 'Description',
  documents: [
    { title: 'Doc 1', docUrl: 'https://storage.suraksha.lk/...' }
  ]
});
```

### Hooks

#### useS3Upload Hook
Convenient hook for React components:

```typescript
import { useS3Upload } from '@/hooks/useS3Upload';

const MyComponent = () => {
  const { uploadFile, uploading, progress, error } = useS3Upload();

  const handleUpload = async (file: File) => {
    const result = await uploadFile(
      file,
      '/organization/api/v1/signed-urls/lecture',
      {
        lectureId: lectureId,
        fileExtension: '.pdf',
        documentType: 'document',
      }
    );
    console.log('Uploaded:', result.publicUrl);
  };

  return (
    <div>
      {uploading && <Progress value={progress} />}
      {error && <p>Error: {error}</p>}
    </div>
  );
};
```

### Example Components

#### CreateLectureForm.tsx
Complete example of the 3-step upload flow:

1. **Upload files to S3 first**
2. **Create lecture with document URLs**

```typescript
// Step 1: Upload all documents to S3
const uploadedDocuments = [];
for (const file of documents) {
  const uploadResult = await uploadFile(
    file,
    '/organization/api/v1/signed-urls/lecture',
    {
      lectureId: '0',
      documentType: 'document',
      fileExtension: '.' + file.name.split('.').pop(),
      contentType: file.type,
    }
  );
  uploadedDocuments.push({
    title: file.name,
    description: 'Document',
    docUrl: uploadResult.publicUrl, // Use publicUrl!
  });
}

// Step 2: Create lecture with JSON
await createLectureWithDocuments(causeId, {
  title,
  description,
  // ... other fields
  documents: uploadedDocuments,
});
```

#### CreateCourseForm.tsx
Example for uploading images:

```typescript
// Upload image to S3
const uploadResult = await uploadFile(
  image,
  '/organization/api/v1/signed-urls/cause',
  {
    causeId: organizationId,
    fileExtension: '.jpg',
  }
);

// Create course with image URL
await createCourseWithImage({
  title: 'My Course',
  organizationId,
  imageUrl: uploadResult.publicUrl,
});
```

---

## Common Mistakes to Avoid

### ❌ Wrong: Sending multipart/form-data
```javascript
// DON'T DO THIS
const formData = new FormData();
formData.append('title', 'My Lecture');
formData.append('file', fileBlob);

await fetch('/lectures/with-documents/10', {
  method: 'POST',
  body: formData, // ← WRONG! Backend expects JSON
});
```

### ✅ Correct: Use signed URL flow with JSON
```javascript
// Step 1 & 2: Upload to S3 first
const { publicUrl } = await uploadToS3(file);

// Step 3: Send JSON with URL
await fetch('/lectures/with-documents/10', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // ← CORRECT
  },
  body: JSON.stringify({
    title: 'My Lecture',
    documents: [{ title: 'Doc', docUrl: publicUrl }],
  }),
});
```

### ❌ Wrong: Using uploadUrl in backend requests
```javascript
// Step 1: Get signed URL
const { uploadUrl, publicUrl } = await getSignedUrl();

// Step 2: Upload to S3
await uploadToS3(uploadUrl, file);

// Step 3: DON'T USE uploadUrl here!
await createLecture({
  documents: [{ docUrl: uploadUrl }] // ❌ WRONG!
});
```

### ✅ Correct: Use publicUrl
```javascript
// Step 3: Use publicUrl (not uploadUrl!)
await createLecture({
  documents: [{ docUrl: publicUrl }] // ✅ CORRECT!
});
```

---

## Error Handling

### Common Errors and Solutions

**Error:** `title is required and cannot be empty`
- **Cause:** Frontend sending `multipart/form-data` instead of JSON
- **Solution:** Use `Content-Type: application/json` and send data as JSON

**Error:** `Failed to upload file to S3`
- **Cause:** Wrong Content-Type in Step 2, or expired signed URL
- **Solution:** Ensure Content-Type matches file type, use signed URL within 10 minutes

**Error:** `Invalid PDF URL format`
- **Cause:** Sending uploadUrl instead of publicUrl, or missing docUrl
- **Solution:** Use `publicUrl` from Step 1 response, not `uploadUrl`

---

## Supported File Types

### Documents (lecture-documents folder)
- PDF: `application/pdf`
- Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Text: `text/plain`

### Images (cause-images, profile-images folders)
- JPEG: `image/jpeg`
- PNG: `image/png`
- WebP: `image/webp`
- GIF: `image/gif`

---

## Testing Upload Flow

### Using cURL

```bash
# Step 1: Get signed URL
curl -X POST http://localhost:8080/organization/api/v1/signed-urls/lecture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "lectureId": "123",
    "fileExtension": ".pdf",
    "documentType": "document"
  }'

# Step 2: Upload to S3
curl -X PUT "SIGNED_URL_FROM_STEP_1" \
  -H "Content-Type: application/pdf" \
  --data-binary @test.pdf

# Step 3: Create lecture
curl -X POST http://localhost:8080/organization/api/v1/lectures/with-documents/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Lecture",
    "description": "Test",
    "documents": [{
      "title": "Test Doc",
      "docUrl": "https://storage.suraksha.lk/lecture-documents/doc-abc123.pdf"
    }]
  }'
```

---

## Summary Checklist

- [x] Request signed URL from `/organization/api/v1/signed-urls/lecture` or similar
- [x] Upload file to S3 using `uploadUrl` with PUT method and correct Content-Type
- [x] Use `publicUrl` (not uploadUrl) in subsequent API calls
- [x] Send lecture/cause data as `application/json`, not multipart/form-data
- [x] Include documents array with `docUrl` fields pointing to uploaded files
- [x] Verify full URLs are returned in API responses
- [x] Handle upload progress and errors gracefully

**Remember:** Files go to S3, URLs go to backend! 🚀
