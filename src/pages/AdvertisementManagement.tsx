import { useState } from 'react';
import { Eye, RefreshCw, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import CreateAdvertisementModal from '@/components/CreateAdvertisementModal';

interface Advertisement {
  id: string;
  adId: string;
  title: string;
  content: string;
  mediaType: string;
  mediaUrl: string;
  maxSends: number;
  currentSendCount: number;
  targetingScope: string;
  targetingCriteria: any;
  priority: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  isActive: boolean;
  metrics: {
    views: number;
    clicks: number;
    impressions: number;
    totalSent?: number;
    deliveryRate?: number;
  };
  metadata: any;
  type: string;
  targetCriteria: any;
  active: boolean;
}

export default function AdvertisementManagement() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [allAdvertisements, setAllAdvertisements] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);

  // Mock data for demonstration since API endpoint doesn't exist
  const mockAdvertisements: Advertisement[] = [
    {
      id: "AD003",
      adId: "AD003",
      title: "Science Exhibition",
      content: "Participate in the inter-school science exhibition.",
      mediaType: "image",
      mediaUrl: "",
      maxSends: 1000,
      currentSendCount: 0,
      targetingScope: "institute",
      targetingCriteria: {
        institutes: ["INST001"],
        cities: [],
        subscriptionPlans: [],
        occupations: [],
        workplaces: []
      },
      priority: 9,
      startDate: "2025-09-15T00:00:00.000Z",
      endDate: "2025-10-15T00:00:00.000Z",
      createdBy: "anura.kumara@teacher.lk",
      isActive: true,
      metrics: {
        views: 0,
        clicks: 0,
        impressions: 0
      },
      metadata: {
        category: "events",
        budget: 15000
      },
      type: "image",
      targetCriteria: {
        scope: "institute",
        instituteIds: ["INST001"],
        cities: []
      },
      active: true
    },
    {
      id: "AD001",
      adId: "AD001",
      title: "Mathematics Tuition Classes",
      content: "Join our advanced mathematics classes for Grade 10-12 students.",
      mediaType: "image",
      mediaUrl: "",
      maxSends: 1000,
      currentSendCount: 0,
      targetingScope: "grade",
      targetingCriteria: {
        institutes: [],
        cities: [],
        subscriptionPlans: [],
        occupations: [],
        workplaces: []
      },
      priority: 8,
      startDate: "2025-09-01T00:00:00.000Z",
      endDate: "2025-12-31T00:00:00.000Z",
      createdBy: "admin@laas.lk",
      isActive: true,
      metrics: {
        views: 0,
        clicks: 0,
        impressions: 0
      },
      metadata: {
        category: "education",
        budget: 50000
      },
      type: "image",
      targetCriteria: {
        scope: "grade",
        instituteIds: [],
        cities: []
      },
      active: true
    }
  ];

  const loadAdvertisements = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getAdvertisements(1, 1000); // Get all data
      if (response.success && response.data) {
        setAllAdvertisements(response.data);
        // Calculate initial pagination
        const totalRecords = response.data.length;
        setTotalCount(totalRecords);
        setTotalPages(Math.ceil(totalRecords / limit));
        
        // Set current page data
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        setAdvertisements(response.data.slice(startIndex, endIndex));
        
        toast({
          title: "Success",
          description: `Loaded ${totalRecords} advertisements successfully`,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to load advertisements from API:', error);
      // Use mock data when API fails
      setAllAdvertisements(mockAdvertisements);
      const totalRecords = mockAdvertisements.length;
      setTotalCount(totalRecords);
      setTotalPages(Math.ceil(totalRecords / limit));
      
      // Set current page data
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      setAdvertisements(mockAdvertisements.slice(startIndex, endIndex));
      
      toast({
        title: "API Not Available",
        description: `Loaded ${totalRecords} sample advertisements`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  // Update displayed data when page or limit changes
  const updateDisplayedData = (page: number, pageLimit: number) => {
    const startIndex = (page - 1) * pageLimit;
    const endIndex = startIndex + pageLimit;
    const displayData = allAdvertisements.slice(startIndex, endIndex);
    
    setAdvertisements(displayData);
    setCurrentPage(page);
    setLimit(pageLimit);
    setTotalPages(Math.ceil(allAdvertisements.length / pageLimit));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      updateDisplayedData(page, limit);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    updateDisplayedData(1, newLimit); // Reset to first page when changing limit
  };

  const handleViewDetails = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsViewModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // Reload advertisements after successful creation
    loadAdvertisements();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTargetingScope = (scope: unknown) => {
    const s = typeof scope === 'string' ? scope : '';
    if (!s) return 'N/A';
    return s[0].toUpperCase() + s.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Advertisement Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all advertisements in the system
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="flex items-center gap-4">
            <CardTitle>All Advertisements</CardTitle>
            {hasLoaded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show:</span>
                <select 
                  value={limit} 
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                  disabled={isLoading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Advertisement
            </Button>
            <Button 
              onClick={() => loadAdvertisements()}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Load Advertisements'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasLoaded ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">Click "Load Advertisements" to fetch advertisement data</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : advertisements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No advertisements found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Max Sends</TableHead>
                    <TableHead>Targeting Scope</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisements.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-mono text-sm">{ad.adId}</TableCell>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.maxSends?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatTargetingScope(ad.targetingScope)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ad.priority >= 8 ? "default" : ad.priority >= 5 ? "secondary" : "outline"}>
                          {ad.priority || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ad.isActive ? "default" : "secondary"}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(ad)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {hasLoaded && advertisements.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} advertisements
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={isLoading}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advertisement Details</DialogTitle>
          </DialogHeader>
          
          {selectedAd && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Advertisement ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedAd.adId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="mt-1 font-medium">{selectedAd.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Media Type</label>
                  <p className="mt-1">{selectedAd.mediaType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <Badge variant={selectedAd.priority >= 8 ? "default" : selectedAd.priority >= 5 ? "secondary" : "outline"}>
                    {selectedAd.priority}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Content</label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">{selectedAd.content}</p>
              </div>

              {/* Media URL */}
              {selectedAd.mediaUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Media</label>
                  <div className="mt-2">
                    {selectedAd.mediaType === 'image' ? (
                      <img 
                        src={selectedAd.mediaUrl} 
                        alt={selectedAd.title}
                        className="max-w-full max-h-64 rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = document.createElement('a');
                          fallback.href = selectedAd.mediaUrl;
                          fallback.target = '_blank';
                          fallback.rel = 'noopener noreferrer';
                          fallback.className = 'text-sm text-primary hover:underline break-all';
                          fallback.textContent = selectedAd.mediaUrl;
                          e.currentTarget.parentElement?.appendChild(fallback);
                        }}
                      />
                    ) : selectedAd.mediaType === 'video' ? (
                      <video 
                        src={selectedAd.mediaUrl} 
                        controls
                        className="max-w-full max-h-64 rounded-md border"
                      />
                    ) : (
                      <a 
                        href={selectedAd.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {selectedAd.mediaUrl}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Targeting Information */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Targeting Scope</label>
                <p className="mt-1">
                  <Badge variant="outline">{formatTargetingScope(selectedAd.targetingScope)}</Badge>
                </p>
              </div>

              {/* Targeting Criteria */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Targeting Criteria</label>
                <div className="mt-1 bg-muted p-3 rounded-md space-y-2">
                  {(selectedAd as any).targetInstituteIds?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Institutes</p>
                      <p className="text-sm">{(selectedAd as any).targetInstituteIds.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetCities?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Cities</p>
                      <p className="text-sm">{(selectedAd as any).targetCities.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetProvinces?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Provinces</p>
                      <p className="text-sm">{(selectedAd as any).targetProvinces.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetDistricts?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Districts</p>
                      <p className="text-sm">{(selectedAd as any).targetDistricts.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetOccupations?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Occupations</p>
                      <p className="text-sm">{(selectedAd as any).targetOccupations.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetGenders?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Genders</p>
                      <p className="text-sm">{(selectedAd as any).targetGenders.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetUserTypes?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target User Types</p>
                      <p className="text-sm">{(selectedAd as any).targetUserTypes.join(', ')}</p>
                    </div>
                  )}
                  {(selectedAd as any).targetSubscriptionPlans?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Subscription Plans</p>
                      <p className="text-sm">{(selectedAd as any).targetSubscriptionPlans.join(', ')}</p>
                    </div>
                  )}
                  {((selectedAd as any).minBornYear || (selectedAd as any).maxBornYear) && (
                    <div>
                      <p className="text-xs text-muted-foreground">Birth Year Range</p>
                      <p className="text-sm">{(selectedAd as any).minBornYear || 'N/A'} - {(selectedAd as any).maxBornYear || 'N/A'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Send Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Sends</label>
                  <p className="mt-1">{selectedAd.maxSends?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Send Count</label>
                  <p className="mt-1">{selectedAd.currentSendCount?.toLocaleString() || '0'}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="mt-1">{formatDate(selectedAd.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="mt-1">{formatDate(selectedAd.endDate)}</p>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Metrics</label>
                <div className="mt-1 grid grid-cols-3 gap-4 bg-muted p-3 rounded-md">
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="font-medium">{selectedAd.metrics?.views?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                    <p className="font-medium">{selectedAd.metrics?.clicks?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="font-medium">{selectedAd.metrics?.impressions?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="mt-1 text-sm">{selectedAd.createdBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="mt-1">
                    <Badge variant={selectedAd.isActive ? "default" : "secondary"}>
                      {selectedAd.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Metadata */}
              {selectedAd.metadata && Object.keys(selectedAd.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Metadata</label>
                  <div className="mt-1 bg-muted p-3 rounded-md space-y-2">
                    {Object.entries(selectedAd.metadata).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Advertisement Modal */}
      <CreateAdvertisementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}