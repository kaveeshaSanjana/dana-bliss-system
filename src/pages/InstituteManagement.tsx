import { useState } from 'react';
import { Search, Building2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateInstituteModal } from '@/components/CreateInstituteModal';
import { AssignUserModal } from '@/components/AssignUserModal';
import { InstituteDetailsModal } from '@/components/InstituteDetailsModal';
import { CreateMaskModal } from '@/components/CreateMaskModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/utils';
import ApiService from '@/services/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  type: string;
}

export function InstituteManagement() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleViewInstitute = (institute: Institute) => {
    setSelectedInstitute(institute);
    setIsDetailsModalOpen(true);
  };

  const loadInstitutes = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await ApiService.getInstitutes(page, 10, searchQuery || undefined, undefined, true);
      setInstitutes(response.data);
      setMeta(response.meta);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Failed to load institutes",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstituteCreated = () => {
    loadInstitutes();
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredInstitutes = institutes.filter((institute) => 
    (institute.name ?? '').toLowerCase().includes(q) ||
    (institute.code ?? '').toLowerCase().includes(q) ||
    (institute.email ?? '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Institute Management</h2>
          <p className="text-muted-foreground">Manage educational institutions in the system</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => loadInstitutes()} variant="outline" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Institutes"}
          </Button>
          <AssignUserModal onUserAssigned={handleInstituteCreated} />
          <CreateInstituteModal onInstituteCreated={handleInstituteCreated} />
        </div>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutes by name, code, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Institutes Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Image</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Mask</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstitutes.map((institute) => (
                  <TableRow key={institute.id} className="border-border">
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getImageUrl(institute.imageUrl)} alt={institute.name} />
                        <AvatarFallback className="bg-muted">
                          <Building2 className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">#{institute.id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{institute.name}</div>
                        <div className="text-sm text-muted-foreground">{institute.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {institute.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {institute.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={institute.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {institute.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="text-sm text-foreground truncate">
                          {institute.address}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {institute.city}, {institute.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CreateMaskModal 
                        instituteId={institute.id}
                        onMaskCreated={handleInstituteCreated}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInstitute(institute)}
                        className="p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredInstitutes.length === 0 && institutes.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No institutes found matching your search criteria.</p>
            </div>
          )}
          {institutes.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No institutes loaded yet.</p>
              <Button onClick={() => loadInstitutes()} disabled={isLoading}>
                Load Institutes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institute Details Modal */}
      <InstituteDetailsModal
        institute={selectedInstitute}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedInstitute(null);
        }}
      />
      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => meta.hasPreviousPage && loadInstitutes(currentPage - 1)}
                  className={!meta.hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => loadInstitutes(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => meta.hasNextPage && loadInstitutes(currentPage + 1)}
                  className={!meta.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}