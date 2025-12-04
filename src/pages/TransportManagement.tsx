import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Truck, CheckCircle, Clock, Calendar, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

interface Owner {
  _id: string;
  ownerName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
}

interface Transport {
  id: number;
  vehicleNumber: string;
  vehicleModel: string | null;
  monthlyFee: number;
  imageUrl: string | null;
  isAvailable: boolean;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerEmail: string | null;
  route: string;
  capacity: number;
  availableSeats: number;
  isActive: boolean;
  status: 'approved' | 'rejected' | 'pending';
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  vehicleImages: string[];
  amenities: any[];
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
}

interface TransportResponse {
  bookhires: Transport[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function TransportManagement() {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response: TransportResponse = await ApiService.getTransport();
      setTransports(response.bookhires || []);
      toast({
        title: "Success",
        description: `Loaded ${response.bookhires?.length || 0} transport records`,
      });
    } catch (error) {
      console.error('Error fetching transports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transport data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerifyTransport = async (transportId: number) => {
    try {
      await ApiService.verifyTransport(transportId);
      toast({
        title: "Success",
        description: "Transport verified successfully",
      });
      fetchTransports();
    } catch (error) {
      console.error('Error verifying transport:', error);
      toast({
        title: "Error",
        description: "Failed to verify transport",
        variant: "destructive",
      });
    }
  };

  const handleRejectTransport = async (transportId: number) => {
    try {
      await ApiService.rejectTransport(transportId);
      toast({
        title: "Success",
        description: "Transport rejected successfully",
      });
      fetchTransports();
    } catch (error) {
      console.error('Error rejecting transport:', error);
      toast({
        title: "Error",
        description: "Failed to reject transport",
        variant: "destructive",
      });
    }
  };

  const q = searchTerm.toLowerCase().trim();
  const filteredTransports = transports.filter((transport) => {
    const vehicleModel = (transport.vehicleModel ?? '').toLowerCase();
    const vehicle = (transport.vehicleNumber ?? '').toLowerCase();
    const route = (transport.route ?? '').toLowerCase();
    const ownerName = (transport.ownerName ?? '').toLowerCase();
    const ownerEmail = (transport.ownerEmail ?? '').toLowerCase();

    const matchesSearch =
      q === '' ||
      vehicleModel.includes(q) ||
      vehicle.includes(q) ||
      route.includes(q) ||
      ownerName.includes(q) ||
      ownerEmail.includes(q);

    const matchesFilter = 
      (activeTab === 'pending' && transport.status === 'pending') ||
      (activeTab === 'verified' && transport.status === 'approved') ||
      (activeTab === 'rejected' && transport.status === 'rejected');

    return matchesSearch && matchesFilter;
  });

  const pendingCount = transports.filter(t => t.status === 'pending').length;
  const verifiedCount = transports.filter(t => t.status === 'approved').length;
  const rejectedCount = transports.filter(t => t.status === 'rejected').length;

  const renderTransportTable = (transportList: Transport[], showActions = false) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle Info</TableHead>
            <TableHead>Owner Details</TableHead>
            <TableHead>Route & Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dates</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transportList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-muted-foreground">
                No transport records found
              </TableCell>
            </TableRow>
          ) : (
            transportList.map((transport) => (
              <TableRow key={transport.id}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="font-medium">{transport.vehicleModel || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {transport.vehicleNumber}
                    </div>
                    {transport.imageUrl && (
                      <img 
                        src={transport.imageUrl} 
                        alt={transport.vehicleModel || 'Vehicle'}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {transport.ownerName || transport.ownerEmail ? (
                    <div className="space-y-1">
                      <div className="font-medium">{transport.ownerName || 'Anonymous'}</div>
                      {transport.ownerEmail && (
                        <div className="text-xs text-muted-foreground">
                          {transport.ownerEmail}
                        </div>
                      )}
                      {transport.ownerPhone && (
                        <div className="text-xs text-muted-foreground">
                          {transport.ownerPhone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No owner data</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {transport.route}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Capacity: {transport.capacity}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-2">
                    <Badge variant={transport.status === 'approved' ? 'default' : transport.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {transport.status === 'approved' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                      ) : transport.status === 'rejected' ? (
                        <><Clock className="h-3 w-3 mr-1" /> Rejected</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Pending</>
                      )}
                    </Badge>
                    <Badge variant={transport.isActive ? 'default' : 'destructive'}>
                      {transport.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {formatDate(transport.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated: {formatDate(transport.updatedAt)}
                    </div>
                  </div>
                </TableCell>
                
                {showActions && (
                  <TableCell>
                    {transport.status === 'pending' && (
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyTransport(transport.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectTransport(transport.id)}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Transport Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage vehicle bookings and hire services ({transports.length} total)
          </p>
        </div>
        
        <Button 
          onClick={fetchTransports} 
          disabled={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Search className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 'Load Transport Data'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transport Records</CardTitle>
            <Input
              placeholder="Search by title, vehicle number, route, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({verifiedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedCount})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {renderTransportTable(filteredTransports, true)}
            </TabsContent>
            
            <TabsContent value="verified">
              {renderTransportTable(filteredTransports)}
            </TabsContent>
            
            <TabsContent value="rejected">
              {renderTransportTable(filteredTransports)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}