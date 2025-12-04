import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { UserPreviewModal } from '@/components/UserPreviewModal';

interface AssignUserModalProps {
  onUserAssigned: () => void;
}

type AssignmentType = 'by-id' | 'by-phone' | 'by-rfid' | 'by-email';

export function AssignUserModal({ onUserAssigned }: AssignUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('by-id');
  const [userPreviewData, setUserPreviewData] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formData, setFormData] = useState({
    instituteId: '',
    userId: '',
    phoneNumber: '+94',
    rfid: '',
    email: '',
    userIdByInstitute: '',
    instituteUserType: 'STUDENT',
    instituteCardId: '',
    status: 'ACTIVE'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInstitutes();
    }
  }, [isOpen]);

  const loadInstitutes = async () => {
    try {
      const response = await ApiService.getInstitutes();
      setInstitutes(response.data);
    } catch (error) {
      toast({
        title: "Failed to load institutes",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreviewUser = async () => {
    if (assignmentType === 'by-id' && formData.userId) {
      setIsPreviewLoading(true);
      try {
        const userData = await ApiService.getUserBasicById(formData.userId);
        setUserPreviewData(userData);
        setIsPreviewOpen(true);
      } catch (error) {
        toast({
          title: "Failed to load user",
          description: "User not found or error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (assignmentType === 'by-phone' && formData.phoneNumber) {
      setIsPreviewLoading(true);
      try {
        const userData = await ApiService.getUserBasicByPhone(formData.phoneNumber);
        setUserPreviewData(userData);
        setIsPreviewOpen(true);
      } catch (error) {
        toast({
          title: "Failed to load user",
          description: "User not found or error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsPreviewLoading(false);
      }
    } else if (assignmentType === 'by-email' && formData.email) {
      setIsPreviewLoading(true);
      try {
        const userData = await ApiService.getUserBasicByEmail(formData.email);
        setUserPreviewData(userData);
        setIsPreviewOpen(true);
      } catch (error) {
        toast({
          title: "Failed to load user",
          description: "User not found or error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsPreviewLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instituteId || !formData.userIdByInstitute || !formData.instituteUserType) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate specific fields based on assignment type
    if (assignmentType === 'by-id' && !formData.userId) {
      toast({
        title: "Please enter User ID",
        variant: "destructive",
      });
      return;
    }

    if (assignmentType === 'by-phone' && !formData.phoneNumber) {
      toast({
        title: "Please enter phone number",
        variant: "destructive",
      });
      return;
    }

    if (assignmentType === 'by-rfid' && !formData.rfid) {
      toast({
        title: "Please enter RFID",
        variant: "destructive",
      });
      return;
    }

    if (assignmentType === 'by-email' && !formData.email) {
      toast({
        title: "Please enter email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let response;
      let imageUrl = '';
      
      // Upload image using signed URL if provided
      if (imageFile) {
        imageUrl = await ApiService.uploadFile('institute-user-images', imageFile);
      }
      
      if (assignmentType === 'by-id') {
        const assignmentData = {
          userId: formData.userId,
          instituteUserType: formData.instituteUserType,
          userIdByInstitute: formData.userIdByInstitute,
          instituteCardId: formData.instituteCardId || undefined,
          instituteImage: imageUrl || undefined,
        };
        
        response = await ApiService.assignUserById(formData.instituteId, assignmentData);
      } else if (assignmentType === 'by-phone') {
        const assignmentData = {
          phoneNumber: formData.phoneNumber,
          instituteUserType: formData.instituteUserType,
          userIdByInstitute: formData.userIdByInstitute,
          instituteCardId: formData.instituteCardId || undefined,
          imageUrl: imageUrl || undefined,
        };
        
        response = await ApiService.assignUserByPhone(formData.instituteId, assignmentData);
      } else if (assignmentType === 'by-rfid') {
        const assignmentData = {
          rfid: formData.rfid,
          instituteUserType: formData.instituteUserType,
          userIdByInstitute: formData.userIdByInstitute,
          instituteCardId: formData.instituteCardId || undefined,
          imageUrl: imageUrl || undefined,
        };
        
        response = await ApiService.assignStudentByRfid(formData.instituteId, assignmentData);
      } else if (assignmentType === 'by-email') {
        const assignmentData = {
          email: formData.email,
          instituteUserType: formData.instituteUserType,
          userIdByInstitute: formData.userIdByInstitute,
          instituteCardId: formData.instituteCardId || undefined,
          instituteImage: imageUrl || undefined,
        };
        
        response = await ApiService.assignUserByEmail(formData.instituteId, assignmentData);
      }

      toast({
        title: "User assigned successfully",
        description: response?.message || "User has been assigned to the institute.",
      });
      
      setFormData({
        instituteId: '',
        userId: '',
        phoneNumber: '+94',
        rfid: '',
        email: '',
        userIdByInstitute: '',
        instituteUserType: 'STUDENT',
        instituteCardId: '',
        status: 'ACTIVE'
      });
      setImageFile(null);
      setIsOpen(false);
      onUserAssigned();
    } catch (error) {
      toast({
        title: "Failed to assign user",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus className="w-4 h-4 mr-2" />
          Assign User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Assign User to Institute</DialogTitle>
          <DialogDescription>
            Assign an existing user to an institute with a specific user ID.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institute" className="text-foreground">Institute *</Label>
            <Select value={formData.instituteId} onValueChange={(value) => handleInputChange('instituteId', value)}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue placeholder="Select an institute" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {institutes.map((institute) => (
                  <SelectItem key={institute.id} value={institute.id}>
                    {institute.name} ({institute.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Assignment Type *</Label>
            <Select value={assignmentType} onValueChange={(value) => setAssignmentType(value as AssignmentType)}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue placeholder="Select assignment type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="by-id">Assign user by ID</SelectItem>
                <SelectItem value="by-phone">Assign user by Phone number</SelectItem>
                <SelectItem value="by-rfid">Assign Student by RFID</SelectItem>
                <SelectItem value="by-email">Assign by Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assignmentType === 'by-id' && (
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-foreground">User ID *</Label>
              <div className="flex gap-2">
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={formData.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  className="border-border bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePreviewUser}
                  disabled={!formData.userId || isPreviewLoading}
                  className="border-border"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {assignmentType === 'by-phone' && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-foreground">Phone Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="phoneNumber"
                  placeholder="+9470XXXXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="border-border bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePreviewUser}
                  disabled={!formData.phoneNumber || formData.phoneNumber === '+94' || isPreviewLoading}
                  className="border-border"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {assignmentType === 'by-rfid' && (
            <div className="space-y-2">
              <Label htmlFor="rfid" className="text-foreground">RFID *</Label>
              <Input
                id="rfid"
                placeholder="Enter RFID tag"
                value={formData.rfid}
                onChange={(e) => handleInputChange('rfid', e.target.value)}
                className="border-border bg-background"
              />
            </div>
          )}

          {assignmentType === 'by-email' && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email *</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-border bg-background"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePreviewUser}
                  disabled={!formData.email || isPreviewLoading}
                  className="border-border"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="instituteUserType" className="text-foreground">Institute User Type *</Label>
            <Select value={formData.instituteUserType} onValueChange={(value) => handleInputChange('instituteUserType', value)}>
              <SelectTrigger className="border-border bg-background">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="ORGANIZATION_MANAGER">ORGANIZATION_MANAGER</SelectItem>
                <SelectItem value="INSTITUTE_ADMIN">INSTITUTE_ADMIN</SelectItem>
                <SelectItem value="STUDENT">STUDENT</SelectItem>
                <SelectItem value="ATTENDANCE_MARKER">ATTENDANCE_MARKER</SelectItem>
                <SelectItem value="TEACHER">TEACHER</SelectItem>
                <SelectItem value="PARENT">PARENT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userIdByInstitute" className="text-foreground">Institute User ID *</Label>
            <Input
              id="userIdByInstitute"
              placeholder="Enter institute-specific user ID"
              value={formData.userIdByInstitute}
              onChange={(e) => handleInputChange('userIdByInstitute', e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instituteCardId" className="text-foreground">Institute Card ID</Label>
            <Input
              id="instituteCardId"
              placeholder="Enter institute card ID (optional)"
              value={formData.instituteCardId}
              onChange={(e) => handleInputChange('instituteCardId', e.target.value)}
              className="border-border bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-foreground">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="border-border bg-background"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Assigning..." : "Assign User"}
            </Button>
          </div>
        </form>
        
        <UserPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          userData={userPreviewData}
        />
      </DialogContent>
    </Dialog>
  );
}