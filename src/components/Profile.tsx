
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Calendar, Shield, Lock, Eye, EyeOff, Camera, Briefcase, GraduationCap, CreditCard, Languages } from 'lucide-react';
import { useInstituteRole } from '@/hooks/useInstituteRole';

interface UserData {
  id: string;
  nameWithInitials: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  dateOfBirth: string;
  gender: string;
  nic: string;
  birthCertificateNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  occupation: string;
  workplace: string;
  workPhone: string;
  educationLevel: string;
  subscriptionPlan: string;
  language: string;
}

const InfoRow = ({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
    {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
    <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
    <span className="text-sm font-medium text-foreground">{value || '—'}</span>
  </div>
);

const Profile = () => {
  const { user, logout } = useAuth();
  const instituteRole = useInstituteRole();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', nameWithInitials: '', email: '', phone: '', dateOfBirth: '', gender: '',
    nic: '', birthCertificateNo: '', addressLine1: '', addressLine2: '', city: '',
    district: '', province: '', postalCode: '', country: '', joinDate: '',
    occupation: '', workplace: '', workPhone: '', educationLevel: '',
    subscriptionPlan: '', language: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false, newPassword: false, confirmNewPassword: false
  });
  const [activeProfileTab, setActiveProfileTab] = useState('details');

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/auth/me');
      if (response.success && response.data) {
        const d = response.data;
        const ud: UserData = {
          id: d.id || '', nameWithInitials: d.nameWithInitials || '',
          firstName: d.firstName || '', lastName: d.lastName || '',
          email: d.email || '', phone: d.phoneNumber || '',
          userType: d.userType || '', dateOfBirth: d.dateOfBirth || '',
          gender: d.gender || '', nic: d.nic || '',
          birthCertificateNo: d.birthCertificateNo || '',
          addressLine1: d.addressLine1 || '', addressLine2: d.addressLine2 || '',
          city: d.city || '', district: d.district || '',
          province: d.province || '', postalCode: d.postalCode || '',
          country: d.country || '', imageUrl: d.imageUrl || '',
          isActive: d.isActive ?? true, createdAt: d.createdAt || '',
          updatedAt: d.updatedAt || '', occupation: d.occupation || '',
          workplace: d.workplace || '', workPhone: d.workPhone || '',
          educationLevel: d.educationLevel || '',
          subscriptionPlan: d.subscriptionPlan || '', language: d.language || ''
        };
        setUserData(ud);
        setFormData({
          name: `${ud.firstName} ${ud.lastName}`.trim(),
          nameWithInitials: ud.nameWithInitials, email: ud.email, phone: ud.phone,
          dateOfBirth: ud.dateOfBirth, gender: ud.gender, nic: ud.nic,
          birthCertificateNo: ud.birthCertificateNo,
          addressLine1: ud.addressLine1, addressLine2: ud.addressLine2,
          city: ud.city, district: ud.district, province: ud.province,
          postalCode: ud.postalCode, country: ud.country,
          joinDate: ud.createdAt ? new Date(ud.createdAt).toLocaleDateString() : '',
          occupation: ud.occupation, workplace: ud.workplace,
          workPhone: ud.workPhone, educationLevel: ud.educationLevel,
          subscriptionPlan: ud.subscriptionPlan, language: ud.language
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUserData(); }, []);

  const handleImageUpdate = (newImageUrl: string) => {
    if (userData) setUserData({ ...userData, imageUrl: newImageUrl });
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 20) return false;
    return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast({ title: "Error", description: "All password fields are required.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (!validatePassword(passwordData.newPassword)) {
      toast({ title: "Error", description: "Password must be 8-20 characters with uppercase, lowercase, number, and special character.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_LMS_BASE_URL || 'https://lmsapi.suraksha.lk';
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({ title: "Error", description: "Please login again.", variant: "destructive" });
        await logout();
        return;
      }
      let response = await fetch(`${baseUrl}/v2/auth/change-password`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(passwordData)
      });
      if (response.status === 404) {
        response = await fetch(`${baseUrl}/auth/change-password`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(passwordData)
        });
      }
      const data = await response.json();
      if (response.ok && (data.success !== false || data.isSuccess || data.message === "Password changed successfully")) {
        toast({ title: "Success", description: "✅ Password changed! You will be logged out." });
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(async () => { await logout(); }, 2000);
      } else {
        toast({ title: "Error", description: data.message || "Failed to change password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to change password.", variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const currentImageUrl = userData?.imageUrl || '';
  const userTypeDisplay = userData?.userType || user?.userType || 'USER';
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const langDisplay = formData.language === 'E' ? 'English' : formData.language === 'S' ? 'Sinhala' : formData.language;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-2 ring-border">
                <AvatarImage src={currentImageUrl} alt="Profile" />
                <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="change-photo"]')?.click()}
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
              <div className="hidden">
                <ProfileImageUpload currentImageUrl={currentImageUrl} onImageUpdate={handleImageUpdate} />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-foreground">{formData.name || 'Welcome'}</h1>
              <p className="text-muted-foreground text-sm mt-1">{formData.email}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {userTypeDisplay}
                </Badge>
                {formData.joinDate && (
                  <span className="text-xs text-muted-foreground">Joined {formData.joinDate}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="details" className="gap-2">
            <User className="h-4 w-4" /> Details
          </TabsTrigger>
          <TabsTrigger value="change-password" className="gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          {/* Personal Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Name with Initials" value={formData.nameWithInitials} />
              <InfoRow label="Full Name" value={formData.name} />
              <InfoRow icon={Mail} label="Email" value={formData.email} />
              <InfoRow icon={Phone} label="Phone" value={formData.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={formData.dateOfBirth} />
              <InfoRow label="Gender" value={formData.gender} />
              <InfoRow label="NIC" value={formData.nic} />
              <InfoRow label="Birth Cert. No" value={formData.birthCertificateNo} />
              <InfoRow icon={Shield} label="User Type" value={userTypeDisplay} />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Address Line 1" value={formData.addressLine1} />
              <InfoRow label="Address Line 2" value={formData.addressLine2} />
              <InfoRow label="City" value={formData.city} />
              <InfoRow label="District" value={formData.district} />
              <InfoRow label="Province" value={formData.province} />
              <InfoRow label="Postal Code" value={formData.postalCode} />
              <InfoRow label="Country" value={formData.country} />
            </CardContent>
          </Card>

          {/* Professional */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow icon={Briefcase} label="Occupation" value={formData.occupation} />
              <InfoRow label="Workplace" value={formData.workplace} />
              <InfoRow icon={Phone} label="Work Phone" value={formData.workPhone} />
              <InfoRow icon={GraduationCap} label="Education" value={formData.educationLevel} />
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow icon={CreditCard} label="Plan" value={formData.subscriptionPlan || 'FREE'} />
              <InfoRow icon={Languages} label="Language" value={langDisplay} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="change-password" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['currentPassword', 'newPassword', 'confirmNewPassword'] as const).map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field} className="text-sm">
                    {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field}
                      type={passwordVisibility[field] ? 'text' : 'password'}
                      placeholder={field === 'currentPassword' ? 'Enter current password' : field === 'newPassword' ? 'Enter new password' : 'Confirm new password'}
                      value={passwordData[field]}
                      onChange={e => setPasswordData({ ...passwordData, [field]: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisibility({ ...passwordVisibility, [field]: !passwordVisibility[field] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {passwordVisibility[field] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                8-20 characters, with uppercase, lowercase, number, and special character.
              </p>
              <Button onClick={handlePasswordChange} disabled={passwordLoading} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
