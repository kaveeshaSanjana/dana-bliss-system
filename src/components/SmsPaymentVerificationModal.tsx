import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { CheckCircle, XCircle } from 'lucide-react';

interface SmsVerification {
  id: string;
  instituteId: string;
  submittedBy: string;
  requestedCredits: number;
  paymentAmount: string;
  paymentMethod: string;
  paymentReference: string;
  paymentSlipUrl: string | null;
  paymentSlipFilename: string | null;
  status: string;
  submissionNotes: string | null;
  submittedAt: string;
}

interface SmsPaymentVerificationModalProps {
  verification: SmsVerification | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SmsPaymentVerificationModal({
  verification,
  isOpen,
  onClose,
  onSuccess
}: SmsPaymentVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    action: 'APPROVE',
    creditsToGrant: 0,
    adminNotes: '',
    rejectionReason: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification) return;

    setIsLoading(true);
    try {
      const requestBody = {
        action: formData.action,
        ...(formData.action === 'APPROVE' && {
          creditsToGrant: formData.creditsToGrant,
          adminNotes: formData.adminNotes
        }),
        ...(formData.action === 'REJECT' && {
          rejectionReason: formData.rejectionReason
        })
      };

      const baseUrl = localStorage.getItem('api_base_url') || 'https://lms-923357517997.europe-west1.run.app';
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${baseUrl}/sms/admin/verifications/${verification.id}/verify`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const result = await response.json();
      
      toast({
        title: formData.action === 'APPROVE' ? "Payment approved" : "Payment rejected",
        description: result.message || `SMS payment ${formData.action.toLowerCase()}ed successfully`,
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        action: 'APPROVE',
        creditsToGrant: 0,
        adminNotes: '',
        rejectionReason: ''
      });
    } catch (error) {
      toast({
        title: "Failed to verify payment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update creditsToGrant when verification changes
  const handleDialogOpenChange = (open: boolean) => {
    if (open && verification) {
      setFormData(prev => ({
        ...prev,
        creditsToGrant: verification.requestedCredits
      }));
    }
    if (!open) {
      onClose();
    }
  };

  if (!verification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify SMS Payment</DialogTitle>
          <DialogDescription>
            Payment ID: #{verification.id} | Institute: {verification.instituteId} | Amount: ${parseFloat(verification.paymentAmount).toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Requested Credits</p>
              <p className="font-semibold">{verification.requestedCredits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="font-semibold">{verification.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <p className="font-mono text-xs">{verification.paymentReference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-xs">{new Date(verification.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {verification.submissionNotes && (
            <div>
              <Label>Submission Notes</Label>
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted/50 rounded">
                {verification.submissionNotes}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={formData.action}
                onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVE">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Approve
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECT">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Reject
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.action === 'APPROVE' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="creditsToGrant">Credits to Grant</Label>
                  <Input
                    id="creditsToGrant"
                    type="number"
                    value={formData.creditsToGrant}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditsToGrant: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Enter verification notes..."
                    value={formData.adminNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </>
            )}

            {formData.action === 'REJECT' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter reason for rejection..."
                  value={formData.rejectionReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  rows={3}
                  required
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                variant={formData.action === 'APPROVE' ? 'default' : 'destructive'}
              >
                {isLoading ? "Processing..." : formData.action === 'APPROVE' ? "Approve Payment" : "Reject Payment"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
