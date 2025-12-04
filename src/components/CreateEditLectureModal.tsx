import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface Lecture {
  _id: string;
  subjectId: string;
  grade: number;
  title: string;
  description: string;
  lessonNumber: number;
  lectureNumber: number;
  provider: string;
  lectureLink: string;
  coverImageUrl?: string;
  documents: Array<{
    documentName: string;
    documentUrl: string;
    _id: string;
  }>;
  isActive: boolean;
}

interface CreateEditLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lecture?: Lecture | null;
}

export default function CreateEditLectureModal({
  isOpen,
  onClose,
  onSuccess,
  lecture = null,
}: CreateEditLectureModalProps) {
  const [formData, setFormData] = useState({
    subjectId: '',
    grade: 10,
    title: '',
    description: '',
    lessonNumber: 1,
    lectureNumber: 1,
    provider: '',
    lectureLink: '',
    isActive: true,
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!lecture;

  useEffect(() => {
    if (lecture) {
      setFormData({
        subjectId: lecture.subjectId,
        grade: lecture.grade,
        title: lecture.title,
        description: lecture.description,
        lessonNumber: lecture.lessonNumber,
        lectureNumber: lecture.lectureNumber,
        provider: lecture.provider,
        lectureLink: lecture.lectureLink,
        isActive: lecture.isActive,
      });
      
      setCoverImagePreview(lecture.coverImageUrl || '');
      setCoverImage(null);
      setDocumentFiles([]);
    } else {
      setFormData({
        subjectId: '',
        grade: 10,
        title: '',
        description: '',
        lessonNumber: 1,
        lectureNumber: 1,
        provider: '',
        lectureLink: '',
        isActive: true,
      });
      setCoverImage(null);
      setCoverImagePreview('');
      setDocumentFiles([]);
    }
  }, [lecture, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
  };

  const handleDocumentFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles(prev => [...prev, ...files]);
  };

  const removeDocumentFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.provider || (!isEditing && !formData.subjectId)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let coverImageUrl = lecture?.coverImageUrl || '';
      let documentUrls: string[] = [];

      // Generate a temporary lecture ID for uploads if creating new lecture
      const tempLectureId = lecture?._id || `temp_${Date.now()}`;

      // Upload cover image if selected
      if (coverImage) {
        try {
          const uploadResult = await ApiService.uploadLectureFile(coverImage, tempLectureId, 'cover');
          coverImageUrl = uploadResult.relativePath;
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload cover image. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Upload document files if selected
      if (documentFiles.length > 0) {
        try {
          const documentUploadPromises = documentFiles.map(file =>
            ApiService.uploadLectureFile(file, tempLectureId, 'document')
          );
          const uploadResults = await Promise.all(documentUploadPromises);
          documentUrls = uploadResults.map(result => result.relativePath);
        } catch (uploadError) {
          console.error('Error uploading documents:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload documents. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Prepare the data for API
      const submitData: any = {
        grade: formData.grade,
        title: formData.title,
        description: formData.description,
        lessonNumber: formData.lessonNumber,
        lectureNumber: formData.lectureNumber,
        provider: formData.provider,
        lectureLink: formData.lectureLink,
        isActive: formData.isActive,
      };

      if (!isEditing) {
        submitData.subjectId = formData.subjectId;
      }

      if (coverImageUrl) {
        submitData.coverImageUrl = coverImageUrl;
      }

      if (documentUrls.length > 0) {
        submitData.documents = documentUrls.map((url, index) => ({
          documentName: documentFiles[index].name,
          documentUrl: url,
        }));
      }

      if (isEditing && lecture) {
        await ApiService.updateLecture(lecture._id, submitData);
        toast({
          title: "Success",
          description: "Lecture updated successfully!",
        });
      } else {
        await ApiService.createLecture(submitData);
        toast({
          title: "Success",
          description: "Lecture created successfully!",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving lecture:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} lecture. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Lecture' : 'Create New Lecture'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the lecture details below.' : 'Fill out the form to create a new lecture.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isEditing && (
              <div>
                <Label htmlFor="subjectId" className="text-foreground">Subject ID *</Label>
                <Input
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  placeholder="Enter subject ID"
                  required
                  className="border-border bg-background"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="grade" className="text-foreground">Grade *</Label>
              <Input
                id="grade"
                type="number"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                min="1"
                max="13"
                required
                className="border-border bg-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-foreground">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter lecture title"
              required
              className="border-border bg-background"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter lecture description"
              rows={3}
              className="border-border bg-background"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lessonNumber" className="text-foreground">Lesson Number</Label>
              <Input
                id="lessonNumber"
                type="number"
                value={formData.lessonNumber}
                onChange={(e) => handleInputChange('lessonNumber', parseInt(e.target.value))}
                min="1"
                className="border-border bg-background"
              />
            </div>
            
            <div>
              <Label htmlFor="lectureNumber" className="text-foreground">Lecture Number</Label>
              <Input
                id="lectureNumber"
                type="number"
                value={formData.lectureNumber}
                onChange={(e) => handleInputChange('lectureNumber', parseInt(e.target.value))}
                min="1"
                className="border-border bg-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="provider" className="text-foreground">Provider *</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              placeholder="Enter provider name"
              required
              className="border-border bg-background"
            />
          </div>

          <div>
            <Label htmlFor="lectureLink" className="text-foreground">Lecture Link</Label>
            <Input
              id="lectureLink"
              type="url"
              value={formData.lectureLink}
              onChange={(e) => handleInputChange('lectureLink', e.target.value)}
              placeholder="Enter lecture link (e.g., Zoom, Google Meet)"
              className="border-border bg-background"
            />
          </div>

          <div>
            <Label className="text-foreground">Cover Image</Label>
            <div className="mt-2">
              {coverImagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="h-32 w-auto rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeCoverImage}
                    className="absolute -top-2 -right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="border-border bg-background"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-foreground">Documents (PDFs)</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="documents"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleDocumentFilesChange}
                  className="border-border bg-background"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {documentFiles.length > 0 && (
                <div className="space-y-1">
                  {documentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-border rounded bg-background">
                      <span className="text-sm text-foreground">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocumentFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-foreground">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Lecture' : 'Create Lecture')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}