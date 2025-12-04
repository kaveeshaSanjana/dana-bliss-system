import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, MapPin, Calendar, Hash, FileText } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface Institute {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

interface InstituteDetailsModalProps {
  institute: Institute | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InstituteDetailsModal({ institute, isOpen, onClose }: InstituteDetailsModalProps) {
  if (!institute) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Institute Details</DialogTitle>
          <DialogDescription>
            View comprehensive information about {institute.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-muted/50">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getImageUrl(institute.imageUrl)} />
              <AvatarFallback className="bg-admin text-admin-foreground">
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{institute.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Code: {institute.code}
                </Badge>
                <Badge className={institute.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                  {institute.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Contact Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{institute.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{institute.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">
                      {institute.address}<br />
                      {institute.city}, {institute.state}<br />
                      {institute.country} {institute.pinCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">
                System Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Institute ID</p>
                    <p className="font-medium text-foreground">#{institute.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium text-foreground capitalize">{institute.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">{formatDate(institute.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">{formatDate(institute.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}