# Migration Checklist: FormData → S3 Signed URL Flow

## ✅ Completed Updates

### Core Services
- [x] **`src/types/upload.ts`** - Updated types for new API response structure
  - Changed `SignedUrlResponse` to use `uploadUrl` and `publicUrl` directly
  - Removed nested `signedUrl` object with fields
  
- [x] **`src/services/uploadService.ts`** - Refactored for PUT uploads
  - Changed S3 upload method from POST (FormData) to PUT (raw file)
  - Updated `uploadToS3()` to accept `uploadUrl` string instead of object
  - Added comprehensive JSDoc comments
  
- [x] **`src/services/api.ts`** - Updated API functions to accept JSON
  - `createLectureWithDocuments()` now accepts typed object instead of FormData
  - `updateLectureWithDocuments()` now accepts typed object instead of FormData
  - Both functions send `Content-Type: application/json`

### Form Components
- [x] **`src/components/forms/CreateLectureForm.tsx`**
  - Upload documents to S3 first (Steps 1 & 2)
  - Then create lecture with `publicUrl` references (Step 3)
  - Added progress indicator
  
- [x] **`src/components/forms/UpdateLectureForm.tsx`**
  - Same pattern as CreateLectureForm
  - Upload new documents to S3 before updating
  - Added progress indicator
  
- [x] **`src/components/forms/CreateCourseForm.tsx`**
  - Already using correct S3 upload flow ✓
  - No changes needed

### Documentation
- [x] **`UPLOAD_GUIDE.md`** - Comprehensive guide
- [x] **`S3_UPLOAD_QUICK_REFERENCE.md`** - Quick reference

---

## 🔍 Areas to Check

### Other Form Components
Check if these forms need similar updates:

- [ ] `src/components/forms/EnrollOrganizationForm.tsx`
  - Does it upload files? If yes, apply S3 flow
  
- [ ] Any other forms that upload files
  - Search for `FormData` usage in components
  - Search for `multipart/form-data` in API calls

### Command to Find
```bash
# Find files still using FormData
grep -r "new FormData()" src/components --include="*.tsx" --include="*.ts"

# Find files using multipart/form-data
grep -r "multipart/form-data" src/ --include="*.tsx" --include="*.ts"
```

---

## 🧪 Testing Checklist

### Manual Testing

#### Create Lecture with Documents
- [ ] Select multiple PDF/document files
- [ ] Verify upload progress shows correctly
- [ ] Verify lecture created successfully
- [ ] Check database: URLs should be relative paths (e.g., `lecture-documents/doc-abc.pdf`)
- [ ] Check API response: URLs should be full URLs (e.g., `https://storage.suraksha.lk/...`)
- [ ] Verify files accessible via returned URLs

#### Update Lecture with Documents
- [ ] Add new documents to existing lecture
- [ ] Verify upload progress shows correctly
- [ ] Verify lecture updated successfully
- [ ] Check database and API response as above

#### Create Course with Image
- [ ] Upload course image
- [ ] Verify image preview shows
- [ ] Verify course created with image URL
- [ ] Verify image accessible

### Error Scenarios
- [ ] Upload fails (network error) - Should show error message
- [ ] File too large - Should reject before upload
- [ ] Invalid file type - Should reject before upload
- [ ] Backend API error - Should show appropriate error
- [ ] Expired signed URL (wait 10+ minutes) - Should fail gracefully

---

## 🔧 Backend API Verification

### Expected Backend Changes
Verify your backend supports these endpoints and formats:

#### Signed URL Endpoints
- [ ] `POST /organization/api/v1/signed-urls/lecture`
  - Accepts: `{ lectureId, fileExtension, documentType }`
  - Returns: `{ uploadUrl, publicUrl, uploadToken, expiresIn }`

- [ ] `POST /organization/api/v1/signed-urls/cause`
  - Accepts: `{ causeId, fileExtension }`
  - Returns: `{ uploadUrl, publicUrl, uploadToken, expiresIn }`

- [ ] `POST /organization/api/v1/signed-urls/generate`
  - Accepts: `{ folder, fileName, contentType, maxSizeBytes? }`
  - Returns: `{ uploadUrl, publicUrl, uploadToken, expiresIn }`

#### Lecture Endpoints
- [ ] `POST /organization/api/v1/lectures/with-documents/:causeId`
  - Accepts: `Content-Type: application/json`
  - Body includes: `documents: [{ title, description?, docUrl }]`

- [ ] `PUT /organization/api/v1/lectures/:id/with-documents`
  - Accepts: `Content-Type: application/json`
  - Body includes: `documents: [{ title, description?, docUrl }]`

#### Course Endpoints
- [ ] `POST /organization/api/v1/causes/with-image`
  - Accepts: `Content-Type: application/json`
  - Body includes: `imageUrl: string`

---

## 📋 Migration Steps for Other Forms

If you find other forms using FormData, follow these steps:

### 1. Update Imports
```typescript
// Add these imports
import { useS3Upload } from '@/hooks/useS3Upload';
import { Progress } from '@/components/ui/progress';
```

### 2. Add Upload State
```typescript
const { uploadFile, uploading, progress, error } = useS3Upload();
```

### 3. Upload Files Before Submission
```typescript
const handleSubmit = async (formData) => {
  // Step 1 & 2: Upload to S3 first
  const uploadedFiles = [];
  
  for (const file of files) {
    const result = await uploadFile(
      file,
      '/organization/api/v1/signed-urls/lecture', // or appropriate endpoint
      {
        // Required fields based on endpoint
        lectureId: '123',
        fileExtension: '.' + file.name.split('.').pop(),
        contentType: file.type,
      }
    );
    
    uploadedFiles.push({
      title: file.name,
      docUrl: result.publicUrl, // ✅ Use publicUrl
    });
  }
  
  // Step 3: Send JSON to backend
  await apiFunction({
    ...formData,
    files: uploadedFiles, // or documents, images, etc.
  });
};
```

### 4. Update API Function
```typescript
// Change from:
export const createSomething = async (formData: FormData) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
};

// To:
export const createSomething = async (data: {
  title: string;
  files?: Array<{ title: string; docUrl: string }>;
}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(), // Includes 'Content-Type: application/json'
    body: JSON.stringify(data),
  });
};
```

### 5. Add Progress UI
```typescript
<Button disabled={loading || uploading}>
  {uploading ? `Uploading... ${progress}%` : loading ? "Saving..." : "Submit"}
</Button>

{uploading && (
  <div className="mt-4">
    <Progress value={progress} />
    <p className="text-sm text-muted-foreground mt-2">
      Uploading files... {progress}%
    </p>
  </div>
)}
```

---

## 🚨 Common Issues & Solutions

### Issue: "title is required and cannot be empty"
**Cause:** Backend received empty `{}` body  
**Solution:** Verify you're sending `Content-Type: application/json` (not multipart/form-data)

### Issue: Files uploaded but wrong URL in database
**Cause:** Using `uploadUrl` instead of `publicUrl`  
**Solution:** Always use `result.publicUrl` from upload response

### Issue: S3 upload returns 403 Forbidden
**Cause:** Signed URL expired or wrong Content-Type  
**Solution:** 
- Use signed URL within 10 minutes
- Ensure Content-Type header matches file type

### Issue: Documents not showing after creation
**Cause:** Documents array not properly formatted  
**Solution:** Verify each document has `{ title, docUrl }` structure

---

## 📊 Verification Commands

```bash
# Check for remaining FormData usage
grep -r "new FormData()" src/ --include="*.tsx" --include="*.ts" | wc -l

# Should be 0 in components (uploadService.ts excluded)

# Check for multipart/form-data
grep -r "multipart/form-data" src/ --include="*.tsx" --include="*.ts"

# Should be no results

# Run TypeScript checks
npm run type-check

# Run tests if available
npm test
```

---

## 📚 Resources

- **Full Guide:** [UPLOAD_GUIDE.md](./UPLOAD_GUIDE.md)
- **Quick Reference:** [S3_UPLOAD_QUICK_REFERENCE.md](./S3_UPLOAD_QUICK_REFERENCE.md)
- **Example Components:**
  - `src/components/forms/CreateLectureForm.tsx`
  - `src/components/forms/UpdateLectureForm.tsx`
  - `src/components/forms/CreateCourseForm.tsx`

---

## ✨ Benefits of New Approach

1. **Better Error Handling** - Know exactly which step failed
2. **Progress Tracking** - Real-time upload progress
3. **Scalability** - Direct S3 uploads don't burden backend
4. **Security** - Presigned URLs expire automatically
5. **Type Safety** - TypeScript types for all operations
6. **Consistency** - Same pattern across all upload operations

---

**Migration Status:** ✅ Core implementation complete  
**Next Steps:** Test thoroughly and migrate remaining forms if any
