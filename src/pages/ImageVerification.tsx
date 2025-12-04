import { useState, useEffect } from 'react';
import { Eye, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { UserVerificationDetailsModal } from '@/components/UserVerificationDetailsModal';
import { ImageVerifyModal } from '@/components/ImageVerifyModal';

interface UnverifiedUser {
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

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ImageVerification() {
  const [users, setUsers] = useState<UnverifiedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [selectedUser, setSelectedUser] = useState<UnverifiedUser | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const baseUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000';
      const token = localStorage.getItem('access_token');
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : {};
      const instituteId = localStorage.getItem('current_institute_id') || user.instituteId || '1';

      const response = await fetch(
        `${baseUrl}/institute-users/institute/${instituteId}/users/unverified-with-images?page=${currentPage}&limit=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch unverified users');
      }

      const data = await response.json();
      setUsers(data.data);
      setMeta(data.meta);
    } catch (error) {
      toast({
        title: 'Failed to load users',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleViewUser = (user: UnverifiedUser) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleVerifyUser = (user: UnverifiedUser) => {
    setSelectedUser(user);
    setIsVerifyModalOpen(true);
  };

  const handleVerificationSuccess = () => {
    loadUsers();
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredUsers = users.filter((user) => {
    const name = (user.name ?? '').toLowerCase();
    const email = (user.email ?? '').toLowerCase();
    const phone = String(user.phoneNumber ?? '');
    return q === ''
      ? true
      : name.includes(q) || email.includes(q) || phone.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Image Verification</h2>
          <p className="text-dashboard-muted">Review and verify user uploaded images</p>
        </div>
        <Button onClick={() => loadUsers()} variant="outline" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-dashboard-border bg-dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashboard-muted" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-dashboard-border"
                />
              </div>
            </div>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-dashboard-border bg-dashboard-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border">
                  <TableHead>Image</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-dashboard-border">
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {user.instituteUserImageUrl ? (
                          <img 
                            src={user.instituteUserImageUrl} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">No Image</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">#{user.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{user.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{user.phoneNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerifyUser(user)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No unverified users found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, meta.total)} of {meta.total} users
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < meta.totalPages && setCurrentPage(currentPage + 1)}
                  className={currentPage === meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modals */}
      <UserVerificationDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <ImageVerifyModal
        user={selectedUser}
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
