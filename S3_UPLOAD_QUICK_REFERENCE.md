# S3 Upload Quick Reference

## 🚀 3-Step Upload Flow

```
1. Request Signed URL → 2. Upload to S3 (PUT) → 3. Send publicUrl to Backend (JSON)
```

---

## Step-by-Step Implementation

### 1️⃣ Request Signed URL

```typescript
import { uploadService } from '@/services/uploadService';

const signedUrlResponse = await uploadService.getSignedUrl(
  '/organization/api/v1/signed-urls/lecture',
  {
    lectureId: '123',
    fileExtension: '.pdf',
    documentType: 'document',
    contentType: 'application/pdf',
  }
);

// Response: { uploadUrl, publicUrl, uploadToken, expiresIn }
```

### 2️⃣ Upload to S3

```typescript
await uploadService.uploadToS3(
  file,
  signedUrlResponse.uploadUrl,
  'application/pdf'
);
```

### 3️⃣ Send publicUrl to Backend

```typescript
import { createLectureWithDocuments } from '@/services/api';

await createLectureWithDocuments(causeId, {
  title: 'My Lecture',
  description: 'Description',
  documents: [
    {
      title: 'Document Title',
      description: 'Optional description',
      docUrl: signedUrlResponse.publicUrl, // ✅ Use publicUrl!
    }
  ]
});
```

---

## 🎯 Using the Hook (Recommended)

```typescript
import { useS3Upload } from '@/hooks/useS3Upload';

function MyComponent() {
  const { uploadFile, uploading, progress, error } = useS3Upload();

  const handleUpload = async (file: File) => {
    try {
      // This handles all 3 steps internally!
      const result = await uploadFile(
        file,
        '/organization/api/v1/signed-urls/lecture',
        {
          lectureId: '123',
          fileExtension: '.pdf',
          documentType: 'document',
          contentType: file.type,
        }
      );
      
      // Use result.publicUrl in your API calls
      console.log('Uploaded:', result.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## 📍 Available Endpoints

| Endpoint | Use Case | Required Fields |
|----------|----------|----------------|
| `/organization/api/v1/signed-urls/lecture` | Lecture documents | `lectureId`, `fileExtension`, `documentType` |
| `/organization/api/v1/signed-urls/cause` | Cause/Course images | `causeId`, `fileExtension` |
| `/organization/api/v1/signed-urls/profile` | Profile images | `userId`, `fileExtension` |
| `/organization/api/v1/signed-urls/organization` | Organization images | `organizationId`, `fileExtension` |
| `/organization/api/v1/signed-urls/generate` | Generic upload | `folder`, `fileName`, `contentType` |

---

## ⚠️ Critical Points

### ✅ DO:
- Use `publicUrl` for backend API calls (Step 3)
- Send `application/json` Content-Type to backend
- Use `PUT` method for S3 upload (Step 2)
- Include correct `Content-Type` header when uploading to S3

### ❌ DON'T:
- Don't use `uploadUrl` in backend API calls (it has query parameters)
- Don't send `multipart/form-data` to lecture/cause endpoints
- Don't use `POST` method for S3 upload
- Don't skip the Content-Type header

---

## 📝 Full Example: Create Lecture with Documents

```typescript
import { useS3Upload } from '@/hooks/useS3Upload';
import { createLectureWithDocuments } from '@/services/api';
import { toast } from 'sonner';

const CreateLectureForm = ({ causeId, onSuccess }) => {
  const [documents, setDocuments] = useState<File[]>([]);
  const { uploadFile, uploading, progress } = useS3Upload();

  const handleSubmit = async (formData) => {
    try {
      // Step 1 & 2: Upload all documents to S3
      const uploadedDocs = [];
      
      for (const file of documents) {
        const result = await uploadFile(
          file,
          '/organization/api/v1/signed-urls/lecture',
          {
            lectureId: '0',
            documentType: 'document',
            fileExtension: '.' + file.name.split('.').pop(),
            contentType: file.type,
          }
        );
        
        uploadedDocs.push({
          title: file.name,
          description: 'Document',
          docUrl: result.publicUrl, // ✅ Use publicUrl
        });
      }

      // Step 3: Create lecture with JSON
      await createLectureWithDocuments(causeId, {
        title: formData.title,
        description: formData.description,
        documents: uploadedDocs,
        // ... other fields
      });

      toast.success('Lecture created!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create lecture');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {uploading && <Progress value={progress} />}
    </form>
  );
};
```

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| "title is required" error | Backend received empty `{}`. Send JSON, not FormData |
| S3 upload fails | Check Content-Type matches file type. Use signed URL within 10 mins |
| Wrong file URL in database | Use `publicUrl` not `uploadUrl` |
| Files not appearing | Verify you're uploading to S3 (Step 2) before sending to backend |

---

## 📦 File Types

### Documents
- `.pdf` → `application/pdf`
- `.docx` → `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `.txt` → `text/plain`

### Images
- `.jpg/.jpeg` → `image/jpeg`
- `.png` → `image/png`
- `.gif` → `image/gif`
- `.webp` → `image/webp`

---

## 🧪 Test with cURL

```bash
# 1. Get signed URL
curl -X POST http://localhost:8080/organization/api/v1/signed-urls/lecture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"lectureId":"123","fileExtension":".pdf","documentType":"document"}'

# 2. Upload to S3 (use uploadUrl from step 1)
curl -X PUT "UPLOAD_URL_HERE" \
  -H "Content-Type: application/pdf" \
  --data-binary @file.pdf

# 3. Create lecture (use publicUrl from step 1)
curl -X POST http://localhost:8080/organization/api/v1/lectures/with-documents/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test","description":"Test","documents":[{"title":"Doc","docUrl":"PUBLIC_URL_HERE"}]}'
```

---

## 📚 Related Files

- **Types:** `src/types/upload.ts`
- **Service:** `src/services/uploadService.ts`
- **Hook:** `src/hooks/useS3Upload.ts`
- **API:** `src/services/api.ts`
- **Examples:** 
  - `src/components/forms/CreateLectureForm.tsx`
  - `src/components/forms/UpdateLectureForm.tsx`
  - `src/components/forms/CreateCourseForm.tsx`

---

**Need more details?** See [UPLOAD_GUIDE.md](./UPLOAD_GUIDE.md) for comprehensive documentation.
