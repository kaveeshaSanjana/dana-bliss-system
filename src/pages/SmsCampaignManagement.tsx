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
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { SmsCampaignApproveModal } from '@/components/SmsCampaignApproveModal';
import { SmsCampaignRejectModal } from '@/components/SmsCampaignRejectModal';

interface SmsCampaign {
  messageId: string;
  instituteId: string;
  instituteName: string;
  sentBy: string;
  senderName: string;
  messageType: string;
  recipientType: string;
  totalRecipients: number;
  messageTemplate: string;
  estimatedCredits: number;
  status: string;
  createdAt: string;
  scheduledAt: string;
  filterCriteria: {
    classIds?: string[];
    userTypes?: string[];
    subjectIds?: string[];
    instituteId: string;
    recipientType: string;
  };
  maskIdUsed: string;
}

interface SmsCampaignsResponse {
  approvals: SmsCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SmsCampaignManagement() {
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<SmsCampaign | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const loadPendingCampaigns = async () => {
    setIsLoading(true);
    try {
      const baseUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000';
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${baseUrl}/sms/admin/pending-approvals?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch pending campaigns');
      }

      const data: SmsCampaignsResponse = await response.json();
      setCampaigns(data.approvals);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });

      toast({
        title: "Data loaded",
        description: `Found ${data.total} pending campaign(s)`,
      });
    } catch (error) {
      toast({
        title: "Failed to load campaigns",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (campaign: SmsCampaign) => {
    setSelectedCampaign(campaign);
    setIsApproveModalOpen(true);
  };

  const handleReject = (campaign: SmsCampaign) => {
    setSelectedCampaign(campaign);
    setIsRejectModalOpen(true);
  };

  const handleActionSuccess = () => {
    loadPendingCampaigns();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Auto-load pending campaigns on mount and when page/limit change
  useEffect(() => {
    loadPendingCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SMS Campaign Management</h1>
          <p className="text-muted-foreground mt-1">Review and approve pending SMS campaigns</p>
        </div>
        <Button onClick={loadPendingCampaigns} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      {campaigns.length > 0 ? (
        <div className="bg-card rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message ID</TableHead>
                <TableHead>Institute</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.messageId}>
                  <TableCell className="font-medium">#{campaign.messageId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.instituteName}</div>
                      <div className="text-xs text-muted-foreground">ID: {campaign.instituteId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.senderName}</div>
                      <div className="text-xs text-muted-foreground">ID: {campaign.sentBy}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.messageType}</Badge>
                  </TableCell>
                  <TableCell>{campaign.totalRecipients}</TableCell>
                  <TableCell>{campaign.estimatedCredits}</TableCell>
                  <TableCell className="max-w-xs truncate">{campaign.messageTemplate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatDate(campaign.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(campaign)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(campaign)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
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
          <p className="text-muted-foreground">
            {isLoading ? 'Loading campaigns...' : 'No pending campaigns found.'}
          </p>
        </div>
      )}

      <SmsCampaignApproveModal
        campaign={selectedCampaign}
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSuccess={handleActionSuccess}
      />

      <SmsCampaignRejectModal
        campaign={selectedCampaign}
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
