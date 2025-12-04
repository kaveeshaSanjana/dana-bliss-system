import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface UserPreviewData {
  id: string;
  imageUrl?: string;
  fullName: string;
  userType: string;
}

interface UserPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserPreviewData | null;
}

export function UserPreviewModal({ isOpen, onClose, userData }: UserPreviewModalProps) {
  if (!userData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">User Preview</DialogTitle>
          <DialogDescription>
            Quick preview of user information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={getImageUrl(userData.imageUrl)} />
            <AvatarFallback className="bg-admin text-admin-foreground">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg text-foreground">{userData.fullName}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ID: {userData.id}</span>
              <Badge variant="outline" className="text-xs">
                {userData.userType}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}