import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface UploadClassImageModalProps {
  classData: any;
  onClose: () => void;
  onImageUploaded: () => void;
}

export function UploadClassImageModal({ 
  classData, 
  onClose, 
  onImageUploaded 
}: UploadClassImageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use AWS S3 upload flow
      await ApiService.uploadClassImageS3(classData.id, image);
      toast({
        title: "Image uploaded successfully",
        description: `Image for ${classData.name} has been updated.`,
      });
      onImageUploaded();
    } catch (error) {
      toast({
        title: "Failed to upload image",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Class Image</DialogTitle>
          <DialogDescription>
            Upload a new image for {classData.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Select Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
