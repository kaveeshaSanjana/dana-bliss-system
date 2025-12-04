import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface CreateAdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AdvertisementFormData {
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  targetInstituteIds: string[];
  targetCities: string[];
  targetProvinces: string[];
  targetDistricts: string[];
  minBornYear: number;
  maxBornYear: number;
  targetGenders: string[];
  targetOccupations: string[];
  targetUserTypes: string[];
  targetSubscriptionPlans: string[];
  displayDuration: number;
  priority: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxSendings: number;
  cascadeToParents: boolean;
  budget: number;
  costPerClick: number;
  costPerImpression: number;
  createdBy: string;
}

export default function CreateAdvertisementModal({ isOpen, onClose, onSuccess }: CreateAdvertisementModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<AdvertisementFormData>({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image',
    targetInstituteIds: [],
    targetCities: [],
    targetProvinces: [],
    targetDistricts: [],
    minBornYear: 2005,
    maxBornYear: 2010,
    targetGenders: [],
    targetOccupations: [],
    targetUserTypes: [],
    targetSubscriptionPlans: [],
    displayDuration: 30,
    priority: 5,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxSendings: 1000,
    cascadeToParents: false,
    budget: 5000.00,
    costPerClick: 0.50,
    costPerImpression: 0.05,
    createdBy: '1',
  });

  const [instituteInput, setInstituteInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [districtInput, setDistrictInput] = useState('');
  const [genderInput, setGenderInput] = useState('');
  const [occupationInput, setOccupationInput] = useState('');
  const [userTypeInput, setUserTypeInput] = useState('');
  const [subscriptionPlanInput, setSubscriptionPlanInput] = useState('');

  const handleInputChange = (field: keyof AdvertisementFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: keyof Pick<AdvertisementFormData, 'targetInstituteIds' | 'targetCities' | 'targetProvinces' | 'targetDistricts' | 'targetGenders' | 'targetOccupations' | 'targetUserTypes' | 'targetSubscriptionPlans'>, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
        setValue('');
      }
    }
  };

  const removeFromArray = (field: keyof Pick<AdvertisementFormData, 'targetInstituteIds' | 'targetCities' | 'targetProvinces' | 'targetDistricts' | 'targetGenders' | 'targetOccupations' | 'targetUserTypes' | 'targetSubscriptionPlans'>, value: string) => {
    const currentArray = formData[field] as string[];
    handleInputChange(field, currentArray.filter(item => item !== value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let mediaUrl = formData.mediaUrl;

      // Upload media file if selected
      if (mediaFile) {
        try {
          // Generate a unique advertisement ID for the upload
          const advertisementId = `ADV_${Date.now()}`;
          
          const uploadResult = await ApiService.uploadAdvertisementFile(mediaFile, advertisementId);
          mediaUrl = uploadResult.relativePath;
        } catch (uploadError) {
          console.error('Error uploading media file:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload media file. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Prepare the data for API
      const submitData = {
        ...formData,
        mediaUrl,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString(),
      };

      const response = await ApiService.createAdvertisement(submitData);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Advertisement created successfully",
        });
        onSuccess();
        onClose();
        // Reset form
        setMediaFile(null);
        setFormData({
          title: '',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          targetInstituteIds: [],
          targetCities: [],
          targetProvinces: [],
          targetDistricts: [],
          minBornYear: 2005,
          maxBornYear: 2010,
          targetGenders: [],
          targetOccupations: [],
          targetUserTypes: [],
          targetSubscriptionPlans: [],
          displayDuration: 30,
          priority: 5,
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxSendings: 1000,
          cascadeToParents: false,
          budget: 5000.00,
          costPerClick: 0.50,
          costPerImpression: 0.05,
          createdBy: '1',
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create advertisement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to create advertisement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Advertisement</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new advertisement with targeting options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="createdBy">Created By *</Label>
              <Input
                id="createdBy"
                value={formData.createdBy}
                onChange={(e) => handleInputChange('createdBy', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mediaType">Media Type</Label>
              <Select value={formData.mediaType} onValueChange={(value) => handleInputChange('mediaType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mediaFile">Upload Media File</Label>
              <Input
                id="mediaFile"
                type="file"
                accept="image/*,video/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMediaFile(file);
                    // Auto-detect media type
                    if (file.type.startsWith('image/')) {
                      handleInputChange('mediaType', 'image');
                    } else if (file.type.startsWith('video/')) {
                      handleInputChange('mediaType', 'video');
                    }
                  }
                }}
              />
              {mediaFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {mediaFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="maxSendings">Max Sendings *</Label>
              <Input
                id="maxSendings"
                type="number"
                value={formData.maxSendings}
                onChange={(e) => handleInputChange('maxSendings', parseInt(e.target.value))}
                required
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority (1-10)</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="displayDuration">Display Duration (s)</Label>
              <Input
                id="displayDuration"
                type="number"
                value={formData.displayDuration}
                onChange={(e) => handleInputChange('displayDuration', parseInt(e.target.value))}
                min="1"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="cascadeToParents"
                checked={formData.cascadeToParents}
                onCheckedChange={(checked) => handleInputChange('cascadeToParents', checked)}
              />
              <Label htmlFor="cascadeToParents">Cascade to Parents</Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="budget">Budget *</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value))}
                required
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="costPerClick">Cost Per Click *</Label>
              <Input
                id="costPerClick"
                type="number"
                step="0.01"
                value={formData.costPerClick}
                onChange={(e) => handleInputChange('costPerClick', parseFloat(e.target.value))}
                required
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="costPerImpression">Cost Per Impression *</Label>
              <Input
                id="costPerImpression"
                type="number"
                step="0.01"
                value={formData.costPerImpression}
                onChange={(e) => handleInputChange('costPerImpression', parseFloat(e.target.value))}
                required
                min="0"
              />
            </div>
          </div>

          {/* Targeting Criteria */}
          <div className="space-y-4">
            <h4 className="font-medium">Targeting Criteria</h4>
            
            {/* Target Institute IDs */}
            <div>
              <Label>Target Institute IDs</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={instituteInput}
                  onChange={(e) => setInstituteInput(e.target.value)}
                  placeholder="Enter institute ID"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('targetInstituteIds', instituteInput, setInstituteInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetInstituteIds.map((institute, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {institute}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetInstituteIds', institute)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Cities */}
            <div>
              <Label>Target Cities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city name"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('targetCities', cityInput, setCityInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetCities.map((city, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {city}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetCities', city)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Provinces */}
            <div>
              <Label>Target Provinces</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={provinceInput}
                  onChange={(e) => setProvinceInput(e.target.value)}
                  placeholder="Enter province name"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('targetProvinces', provinceInput, setProvinceInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetProvinces.map((province, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {province}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetProvinces', province)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Districts */}
            <div>
              <Label>Target Districts</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={districtInput}
                  onChange={(e) => setDistrictInput(e.target.value)}
                  placeholder="Enter district name"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('targetDistricts', districtInput, setDistrictInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetDistricts.map((district, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {district}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetDistricts', district)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Birth Year Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minBornYear">Min Born Year</Label>
                <Input
                  id="minBornYear"
                  type="number"
                  value={formData.minBornYear}
                  onChange={(e) => handleInputChange('minBornYear', parseInt(e.target.value))}
                  placeholder="2005"
                />
              </div>
              <div>
                <Label htmlFor="maxBornYear">Max Born Year</Label>
                <Input
                  id="maxBornYear"
                  type="number"
                  value={formData.maxBornYear}
                  onChange={(e) => handleInputChange('maxBornYear', parseInt(e.target.value))}
                  placeholder="2010"
                />
              </div>
            </div>

            {/* Target Genders */}
            <div>
              <Label>Target Genders</Label>
              <div className="flex gap-2 mb-2">
                <Select value={genderInput} onValueChange={setGenderInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addToArray('targetGenders', genderInput, setGenderInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetGenders.map((gender, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {gender}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetGenders', gender)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target User Types */}
            <div>
              <Label>Target User Types</Label>
              <div className="flex gap-2 mb-2">
                <Select value={userTypeInput} onValueChange={setUserTypeInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="PARENT">Parent</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addToArray('targetUserTypes', userTypeInput, setUserTypeInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetUserTypes.map((userType, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {userType}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetUserTypes', userType)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Subscription Plans */}
            <div>
              <Label>Target Subscription Plans</Label>
              <div className="flex gap-2 mb-2">
                <Select value={subscriptionPlanInput} onValueChange={setSubscriptionPlanInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subscription plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addToArray('targetSubscriptionPlans', subscriptionPlanInput, setSubscriptionPlanInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetSubscriptionPlans.map((plan, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {plan}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetSubscriptionPlans', plan)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Occupations */}
            <div>
              <Label>Target Occupations</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={occupationInput}
                  onChange={(e) => setOccupationInput(e.target.value)}
                  placeholder="Enter occupation"
                />
                <Button
                  type="button"
                  onClick={() => addToArray('targetOccupations', occupationInput, setOccupationInput)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.targetOccupations.map((occupation, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
                    {occupation}
                    <Button
                      type="button"
                      onClick={() => removeFromArray('targetOccupations', occupation)}
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Advertisement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}