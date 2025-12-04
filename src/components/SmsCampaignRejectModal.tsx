import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SmsCampaign {
  messageId: string;
  instituteId: string;
  instituteName: string;
  senderName: string;
  messageType: string;
  recipientType: string;
  totalRecipients: number;
  messageTemplate: string;
  estimatedCredits: number;
  maskIdUsed: string;
}

interface SmsCampaignRejectModalProps {
  campaign: SmsCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SmsCampaignRejectModal({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}: SmsCampaignRejectModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReject = async () => {
    if (!campaign) return;

    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this campaign.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000';
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${baseUrl}/sms/admin/campaigns/${campaign.messageId}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            rejectionReason,
            adminNotes 
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject campaign');
      }

      const data = await response.json();

      toast({
        title: "Campaign Rejected",
        description: `Campaign #${data.messageId} has been rejected.`,
      });

      setRejectionReason('');
      setAdminNotes('');
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reject SMS Campaign</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this SMS campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Message ID</Label>
              <p className="font-medium">#{campaign.messageId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Institute</Label>
              <p className="font-medium">{campaign.instituteName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sender</Label>
              <p className="font-medium">{campaign.senderName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Recipients</Label>
              <p className="font-medium">{campaign.totalRecipients}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Message Template</Label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              <p className="text-sm">{campaign.messageTemplate}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter the reason for rejecting this campaign..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-1"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
            <Textarea
              id="adminNotes"
              placeholder="Enter any additional notes..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Campaign'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
