import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SmsPaymentVerificationModal } from '@/components/SmsPaymentVerificationModal';
import { CheckCircle, Loader2 } from 'lucide-react';

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
  creditsGranted: number | null;
  costPerCredit: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  submissionNotes: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface SmsVerificationsResponse {
  verifications: SmsVerification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SmsPaymentManagement() {
  const [verifications, setVerifications] = useState<SmsVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<SmsVerification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const loadPendingPayments = async () => {
    setIsLoading(true);
    try {
      const baseUrl = localStorage.getItem('api_base_url') || 'https://lms-923357517997.europe-west1.run.app';
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${baseUrl}/sms/admin/verifications/pending?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pending payments');
      }

      const data: SmsVerificationsResponse = await response.json();
      setVerifications(data.verifications);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });

      toast({
        title: "Data loaded",
        description: `Found ${data.total} pending payment(s)`,
      });
    } catch (error) {
      toast({
        title: "Failed to load payments",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (verification: SmsVerification) => {
    setSelectedVerification(verification);
    setIsModalOpen(true);
  };

  const handleVerificationSuccess = () => {
    loadPendingPayments();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Auto-load pending payments on mount and when page/limit change
  useEffect(() => {
    loadPendingPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SMS Payment Verification</h1>
          <p className="text-muted-foreground mt-1">Manage pending SMS credit payment requests</p>
        </div>
        <Button onClick={loadPendingPayments} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Load Pending Payments'
          )}
        </Button>
      </div>

      {verifications.length > 0 ? (
        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Institute ID</TableHead>
                <TableHead>Requested Credits</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell className="font-medium">#{verification.id}</TableCell>
                  <TableCell>{verification.instituteId}</TableCell>
                  <TableCell>{verification.requestedCredits.toLocaleString()}</TableCell>
                  <TableCell>${parseFloat(verification.paymentAmount).toFixed(2)}</TableCell>
                  <TableCell>{verification.paymentMethod}</TableCell>
                  <TableCell className="font-mono text-xs">{verification.paymentReference}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      {verification.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(verification.submittedAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleVerify(verification)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Verify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">No pending payments loaded. Click "Load Pending Payments" to fetch data.</p>
        </div>
      )}

      <SmsPaymentVerificationModal
        verification={selectedVerification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVerification(null);
        }}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
