import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface UserImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUploadSuccess: () => void;
}

export function UserImageUploadModal({ isOpen, onClose, userId, onUploadSuccess }: UserImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Step 1: Get signed URL for S3 upload
      const signedUrlResponse = await ApiService.generateSignedUrl('institute-user-images', selectedFile);
      
      // Step 2: Upload to S3 using POST with FormData
      await ApiService.uploadToS3(signedUrlResponse.uploadUrl, signedUrlResponse.fields, selectedFile);
      
      // Step 3: Verify and publish
      await ApiService.verifyAndPublish(signedUrlResponse.relativePath);
      
      // Step 4: Update user with the new image URL
      const baseUrl = localStorage.getItem('api_base_url') || 'https://lms-923357517997.europe-west1.run.app';
      const token = localStorage.getItem('access_token');
      const userRaw = localStorage.getItem('user');
      const currentUser = userRaw ? JSON.parse(userRaw) : {};
      const instituteId = localStorage.getItem('current_institute_id') || currentUser.instituteId || '1';

      const response = await fetch(`${baseUrl}/institute-users/institute/${instituteId}/users/${userId}/update-image`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: signedUrlResponse.relativePath,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user image');
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      onUploadSuccess();
      handleClose();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload User Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to select an image or drag and drop
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" asChild>
                    <span>Select Image</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
