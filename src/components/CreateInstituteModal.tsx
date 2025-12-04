import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { 
  InstituteType, 
  Country, 
  District, 
  Province,
  instituteTypeLabels,
  districtLabels,
  provinceLabels,
  districtToProvince
} from '@/types/location';

interface CreateInstituteModalProps {
  onInstituteCreated: () => void;
}

export function CreateInstituteModal({ onInstituteCreated }: CreateInstituteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: Country.SRI_LANKA,
    district: '',
    province: '',
    pinCode: '',
    type: InstituteType.SCHOOL,
    primaryColorCode: '#4CAF50',
    secondaryColorCode: '#E91E63',
    vision: '',
    mission: '',
    websiteUrl: '',
    facebookPageUrl: '',
    youtubeChannelUrl: '',
    isDefault: 'false'
  });
  
  const [logo, setLogo] = useState<File | null>(null);
  const [loadingGif, setLoadingGif] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [image, setImage] = useState<File | null>(null);

  // Auto-set province when district changes
  const handleDistrictChange = (district: District) => {
    const province = districtToProvince[district];
    setFormData(prev => ({ 
      ...prev, 
      district, 
      province: province || '' 
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload logo and image if present
      let logoUrl = '';
      let imageUrl = '';

      if (logo) {
        logoUrl = await ApiService.uploadFile('institute-images', logo);
      }

      if (image) {
        imageUrl = await ApiService.uploadFile('institute-images', image);
      }

      // Prepare institute data
      const instituteData = {
        ...formData,
        logoUrl,
        imageUrl,
        isDefault: formData.isDefault === 'true',
      };

      await ApiService.createInstitute(instituteData);
      toast({
        title: "Institute created successfully",
        description: `${formData.name} has been added to the system.`,
      });
      setIsOpen(false);
      setFormData({
        name: '',
        shortName: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: Country.SRI_LANKA,
        district: '',
        province: '',
        pinCode: '',
        type: InstituteType.SCHOOL,
        primaryColorCode: '#4CAF50',
        secondaryColorCode: '#E91E63',
        vision: '',
        mission: '',
        websiteUrl: '',
        facebookPageUrl: '',
        youtubeChannelUrl: '',
        isDefault: 'false'
      });
      setLogo(null);
      setLoadingGif(null);
      setImages([]);
      setImage(null);
      onInstituteCreated();
    } catch (error) {
      toast({
        title: "Failed to create institute",
        description: "Please check the form and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-admin hover:bg-admin/90 text-admin-foreground gap-2">
          <Plus className="h-4 w-4" />
          Create Institute
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Institute</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new institute to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institute Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name *</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Institute Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Institute Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(InstituteType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {instituteTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => handleDistrictChange(value as District)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(District).map((district) => (
                    <SelectItem key={district} value={district}>
                      {districtLabels[district]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => handleInputChange('province', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Province).map((province) => (
                    <SelectItem key={province} value={province}>
                      {provinceLabels[province]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pinCode">Pin Code *</Label>
              <Input
                id="pinCode"
                value={formData.pinCode}
                onChange={(e) => handleInputChange('pinCode', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loadingGif">Loading GIF</Label>
            <Input
              id="loadingGif"
              type="file"
              accept="image/gif"
              onChange={(e) => setLoadingGif(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Main Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Additional Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColorCode">Primary Color Code *</Label>
              <Input
                id="primaryColorCode"
                type="color"
                value={formData.primaryColorCode}
                onChange={(e) => handleInputChange('primaryColorCode', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColorCode">Secondary Color Code *</Label>
              <Input
                id="secondaryColorCode"
                type="color"
                value={formData.secondaryColorCode}
                onChange={(e) => handleInputChange('secondaryColorCode', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <textarea
              id="vision"
              value={formData.vision}
              onChange={(e) => handleInputChange('vision', e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter institute vision"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter institute mission"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookPageUrl">Facebook Page URL</Label>
              <Input
                id="facebookPageUrl"
                type="url"
                value={formData.facebookPageUrl}
                onChange={(e) => handleInputChange('facebookPageUrl', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeChannelUrl">YouTube Channel URL</Label>
              <Input
                id="youtubeChannelUrl"
                type="url"
                value={formData.youtubeChannelUrl}
                onChange={(e) => handleInputChange('youtubeChannelUrl', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-admin hover:bg-admin/90 text-admin-foreground"
            >
              {isLoading ? "Creating..." : "Create Institute"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}