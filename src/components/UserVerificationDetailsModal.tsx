import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  phoneNumber: string;
  imageUrl: string;
  gender: string;
  dateOfBirth: string;
  userIdByInstitute: string;
  instituteUserImageUrl: string;
  instituteCardId: string | null;
  imageVerificationStatus: string;
  imageVerifiedBy: string | null;
}

interface UserVerificationDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserVerificationDetailsModal({ user, isOpen, onClose }: UserVerificationDetailsModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Verification Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Profile Image</p>
              <div className="w-full h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-muted-foreground">No Profile Image</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Institute Image</p>
              <div className="w-full h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {user.instituteUserImageUrl ? (
                  <img src={user.instituteUserImageUrl} alt="Institute" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-muted-foreground">No Institute Image</span>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-semibold text-foreground">#{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Institute User ID</p>
                <p className="text-sm font-semibold text-foreground">{user.userIdByInstitute}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-sm text-foreground">{user.phoneNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-sm text-foreground">{user.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-sm text-foreground">{formatDate(user.dateOfBirth)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Address Line 1</p>
              <p className="text-sm text-foreground">{user.addressLine1}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Address Line 2</p>
              <p className="text-sm text-foreground">{user.addressLine2}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Institute Card ID</p>
                <p className="text-sm text-foreground">{user.instituteCardId || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                <Badge className={getStatusColor(user.imageVerificationStatus)}>
                  {user.imageVerificationStatus}
                </Badge>
              </div>
            </div>

            {user.imageVerifiedBy && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified By</p>
                <p className="text-sm text-foreground">{user.imageVerifiedBy}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
