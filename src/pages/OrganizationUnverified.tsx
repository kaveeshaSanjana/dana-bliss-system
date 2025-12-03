import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

interface UnverifiedMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  enrolledAt: string;
}

const OrganizationUnverified = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization } = useOutletContext<{ organization: { id: string; name: string } | null }>();
  const { backendUrl, accessToken } = useUserRole();
  const [unverifiedMembers, setUnverifiedMembers] = useState<UnverifiedMember[]>([]);
  const [totalUnverified, setTotalUnverified] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = async () => {
    if (!backendUrl || !accessToken || !id) {
      return;
    }

    try {
      setLoading(true);
      
      // Fetch unverified members
      const unverifiedResponse = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/members/unverified?page=${page + 1}&limit=${rowsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!unverifiedResponse.ok) {
        throw new Error('Failed to fetch unverified members');
      }

      const unverifiedData = await unverifiedResponse.json();
      setUnverifiedMembers(unverifiedData.unverifiedMembers);
      setTotalUnverified(unverifiedData.totalUnverified);
      setDataLoaded(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  const handleApprove = async (userId: string, memberName: string) => {
    if (!id) return;
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/verify`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, isVerified: true }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve member');
      }

      toast.success(`${memberName} has been approved!`);
      fetchData();
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error("Failed to approve member");
    }
  };

  const handleReject = async (userId: string, memberName: string) => {
    if (!id) return;
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/verify`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, isVerified: false }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject member');
      }

      toast.success(`${memberName}'s request has been rejected`);
      fetchData();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error("Failed to reject member");
    }
  };

  return (
    <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button variant="ghost" size="icon" onClick={() => navigate(`/organization/${id}`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Unverified Members</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Pending Member Requests</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Review and approve membership requests ({totalUnverified} pending)
                </p>
              </div>
              {!dataLoaded && (
                <Button onClick={fetchData} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Load Data
                </Button>
              )}
            </div>

            {!dataLoaded ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Click "Load Data" to view pending member requests</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : unverifiedMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pending member requests
              </div>
            ) : (
              <div className="-mx-6">
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 0 }}>
                  <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ minWidth: 170 }}>Name</TableCell>
                          <TableCell style={{ minWidth: 200 }}>Email</TableCell>
                          <TableCell style={{ minWidth: 120 }}>Role</TableCell>
                          <TableCell style={{ minWidth: 120 }}>Enrolled</TableCell>
                          <TableCell style={{ minWidth: 100 }}>Status</TableCell>
                          <TableCell style={{ minWidth: 200 }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {unverifiedMembers.map((member) => (
                          <TableRow hover key={member.userId}>
                            <TableCell style={{ fontWeight: 500 }}>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{member.role}</Badge>
                            </TableCell>
                            <TableCell style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                              {new Date(member.enrolledAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell align="right">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(member.userId, member.name)}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleReject(member.userId, member.name)}
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalUnverified}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              </div>
            )}
          </div>
        </main>
  );
};

export default OrganizationUnverified;
