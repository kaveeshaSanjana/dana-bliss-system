import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  instituteUserImageUrl: string;
}

interface ImageVerifyModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImageVerifyModal({ user, isOpen, onClose, onSuccess }: ImageVerifyModalProps) {
  const [action, setAction] = useState<'verify' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !action) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000';
      const token = localStorage.getItem('access_token');
      const userRaw = localStorage.getItem('user');
      const currentUser = userRaw ? JSON.parse(userRaw) : {};
      const instituteId = localStorage.getItem('current_institute_id') || currentUser.instituteId || '1';

      const body = action === 'verify' 
        ? { status: 'VERIFIED' }
        : { status: 'REJECTED', rejectionReason: rejectionReason.trim() };

      const response = await fetch(
        `${baseUrl}/institute-users/institute/${instituteId}/users/${user.id}/verify-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process verification');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: data.message || `Image ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      toast({
        title: 'Failed',
        description: error instanceof Error ? error.message : 'Failed to process verification',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setRejectionReason('');
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview */}
          <div className="rounded-lg overflow-hidden bg-muted">
            <img 
              src={user.instituteUserImageUrl} 
              alt={user.name}
              className="w-full h-auto"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            User: <span className="font-medium text-foreground">{user.name}</span>
          </p>

          {/* Action Selection */}
          {!action && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose an action:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-green-600 hover:text-green-700 border-green-200"
                  onClick={() => setAction('verify')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200"
                  onClick={() => setAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Verification Confirmation */}
          {action === 'verify' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                You are about to verify this image. This action will mark the image as verified.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {action && (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={action === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isSubmitting 
                ? 'Processing...' 
                : action === 'verify' 
                  ? 'Confirm Verification' 
                  : 'Confirm Rejection'
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
