import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Camera, X } from 'lucide-react';
import ApiService from '@/services/api';
import { 
  District, 
  Province, 
  Country,
  districtLabels, 
  provinceLabels,
  districtToProvince 
} from '@/types/location';

interface CreateUserModalProps {
  onUserCreated: () => void;
}

const BLOOD_GROUPS = [
  'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
  'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
];

const OCCUPATIONS = [
  'ENGINEER', 'DOCTOR', 'TEACHER', 'BUSINESS', 'FARMER', 
  'GOVERNMENT_EMPLOYEE', 'PRIVATE_EMPLOYEE', 'SELF_EMPLOYED', 'OTHER'
];

export function CreateUserModal({ onUserCreated }: CreateUserModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    userType: 'USER',
    gender: 'MALE',
    dateOfBirth: '',
    nic: '',
    birthCertificateNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: 'COLOMBO',
    province: 'WESTERN',
    postalCode: '',
    country: 'Sri Lanka',
    isActive: 'true',
    idUrl: '',
    studentId: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: '',
    bloodGroup: 'O_POSITIVE',
    fatherId: '',
    fatherPhoneNumber: '',
    motherId: '',
    motherPhoneNumber: '',
    guardianId: '',
    guardianPhoneNumber: '',
    occupation: 'OTHER',
    workplace: '',
    workPhone: '',
    educationLevel: '',
  });

  const startCamera = async () => {
    try {
      setShowCamera(true);
      if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'user' } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsInline', 'true');
        // Autoplay policies: keep muted and call play()
        try { await videoRef.current.play(); } catch {}
      }
      streamRef.current = stream;
    } catch (err: any) {
      // Fallback: use file input with camera capture on mobile
      const msg = err?.name || err?.message || 'Failed to access camera';
      if (
        /NotAllowedError|Permission|Denied|SecurityError|insecure|policy/i.test(String(msg))
      ) {
        toast({
          title: 'Camera permission blocked',
          description: 'Opening device camera via file picker instead.',
        });
        // trigger file input with camera
        fileInputRef.current?.setAttribute('capture', 'environment');
        fileInputRef.current?.click();
      } else {
        toast({
          title: 'Camera Error',
          description: 'Failed to access camera. Please check permissions.',
          variant: 'destructive',
        });
      }
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
            setImageFile(file);
            setImagePreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      (videoRef.current as any).srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = '';
      
      // Upload image using signed URL if provided
      if (imageFile) {
        imageUrl = await ApiService.uploadFile('profile-images', imageFile);
      }

      // Prepare user data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        nic: formData.nic || undefined,
        birthCertificateNo: formData.birthCertificateNo || undefined,
        addressLine1: formData.addressLine1 || undefined,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city || undefined,
        district: formData.district || undefined,
        province: formData.province || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        imageUrl: imageUrl || undefined,
        idUrl: formData.idUrl || undefined,
        isActive: formData.isActive === 'true',
      };

      // Add student data if applicable
      const studentData: any = {};
      if (formData.studentId) studentData.studentId = formData.studentId;
      if (formData.emergencyContact) studentData.emergencyContact = formData.emergencyContact;
      if (formData.medicalConditions) studentData.medicalConditions = formData.medicalConditions;
      if (formData.allergies) studentData.allergies = formData.allergies;
      if (formData.bloodGroup) studentData.bloodGroup = formData.bloodGroup;
      if (formData.fatherId) studentData.fatherId = formData.fatherId;
      if (formData.fatherPhoneNumber) studentData.fatherPhoneNumber = formData.fatherPhoneNumber;
      if (formData.motherId) studentData.motherId = formData.motherId;
      if (formData.motherPhoneNumber) studentData.motherPhoneNumber = formData.motherPhoneNumber;
      if (formData.guardianId) studentData.guardianId = formData.guardianId;
      if (formData.guardianPhoneNumber) studentData.guardianPhoneNumber = formData.guardianPhoneNumber;

      if (Object.keys(studentData).length > 0) {
        (userData as any).studentData = studentData;
      }

      // Add parent data if applicable
      const parentData: any = {};
      if (formData.occupation) parentData.occupation = formData.occupation;
      if (formData.workplace) parentData.workplace = formData.workplace;
      if (formData.workPhone) parentData.workPhone = formData.workPhone;
      if (formData.educationLevel) parentData.educationLevel = formData.educationLevel;

      if (Object.keys(parentData).length > 0) {
        (userData as any).parentData = parentData;
      }

      await ApiService.createComprehensiveUser(userData);
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      setOpen(false);
      onUserCreated();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      userType: 'USER',
      gender: 'MALE',
      dateOfBirth: '',
      nic: '',
      birthCertificateNo: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: 'COLOMBO',
      province: 'WESTERN',
      postalCode: '',
      country: 'Sri Lanka',
      isActive: 'true',
      idUrl: '',
      studentId: '',
      emergencyContact: '',
      medicalConditions: '',
      allergies: '',
      bloodGroup: 'O_POSITIVE',
      fatherId: '',
      fatherPhoneNumber: '',
      motherId: '',
      motherPhoneNumber: '',
      guardianId: '',
      guardianPhoneNumber: '',
      occupation: 'OTHER',
      workplace: '',
      workPhone: '',
      educationLevel: '',
    });
    setImageFile(null);
    setImagePreview('');
    stopCamera();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        stopCamera();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  disabled={showCamera}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="max-w-xs"
                />
              </div>
            </div>

            {showCamera && (
              <div className="space-y-2 border rounded-lg p-4 bg-background">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full max-w-md rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button type="button" onClick={capturePhoto}>
                    Capture Photo
                  </Button>
                  <Button type="button" variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+94xxxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userType">User Type *</Label>
              <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">SUPER ADMIN</SelectItem>
                  <SelectItem value="ORGANIZATION_MANAGER">ORGANIZATION MANAGER</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="USER_WITHOUT_PARENT">USER WITHOUT PARENT</SelectItem>
                  <SelectItem value="USER_WITHOUT_STUDENT">USER WITHOUT STUDENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nic">NIC</Label>
              <Input
                id="nic"
                value={formData.nic}
                onChange={(e) => handleInputChange('nic', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select value={formData.isActive} onValueChange={(value) => handleInputChange('isActive', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => {
                    const province = districtToProvince[value as District];
                    setFormData(prev => ({ 
                      ...prev, 
                      district: value,
                      province: province || prev.province
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(District).map(district => (
                      <SelectItem key={district} value={district}>{districtLabels[district]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Province).map(province => (
                      <SelectItem key={province} value={province}>{provinceLabels[province]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Student Information */}
          {formData.userType !== 'USER_WITHOUT_STUDENT' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Student Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(group => (
                      <SelectItem key={group} value={group}>{group.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Input
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idUrl">ID Document URL</Label>
              <Input
                id="idUrl"
                value={formData.idUrl}
                onChange={(e) => handleInputChange('idUrl', e.target.value)}
              placeholder="https://..."
              />
            </div>
          </div>
          )}

          {/* Parent Information */}
          {formData.userType !== 'USER_WITHOUT_PARENT' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherId">Father ID</Label>
                <Input
                  id="fatherId"
                  value={formData.fatherId}
                  onChange={(e) => handleInputChange('fatherId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherPhoneNumber">Father Phone</Label>
                <Input
                  id="fatherPhoneNumber"
                  value={formData.fatherPhoneNumber}
                  onChange={(e) => handleInputChange('fatherPhoneNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motherId">Mother ID</Label>
                <Input
                  id="motherId"
                  value={formData.motherId}
                  onChange={(e) => handleInputChange('motherId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherPhoneNumber">Mother Phone</Label>
                <Input
                  id="motherPhoneNumber"
                  value={formData.motherPhoneNumber}
                  onChange={(e) => handleInputChange('motherPhoneNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianId">Guardian ID</Label>
                <Input
                  id="guardianId"
                  value={formData.guardianId}
                  onChange={(e) => handleInputChange('guardianId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhoneNumber">Guardian Phone</Label>
                <Input
                  id="guardianPhoneNumber"
                  value={formData.guardianPhoneNumber}
                  onChange={(e) => handleInputChange('guardianPhoneNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
          )}

          {/* Work Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Work Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Select value={formData.occupation} onValueChange={(value) => handleInputChange('occupation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPATIONS.map(occupation => (
                      <SelectItem key={occupation} value={occupation}>
                        {occupation.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workplace">Workplace</Label>
                <Input
                  id="workplace"
                  value={formData.workplace}
                  onChange={(e) => handleInputChange('workplace', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workPhone">Work Phone</Label>
                <Input
                  id="workPhone"
                  value={formData.workPhone}
                  onChange={(e) => handleInputChange('workPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="educationLevel">Education Level</Label>
                <Input
                  id="educationLevel"
                  value={formData.educationLevel}
                  onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
