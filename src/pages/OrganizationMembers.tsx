import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, UserMinus, UserCog, Filter, Search, Crown } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  joinedAt: string;
}

const OrganizationMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization } = useOutletContext<{ organization: { id: string; name: string } | null }>();
  const { backendUrl, accessToken, user, getCurrentRole } = useUserRole();
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Check if user is President
  const isPresident = () => {
    if (!id || !user) return false;
    const role = getCurrentRole(id);
    return role === 'PRESIDENT';
  };

  // Check if user can remove members (President or Admin)
  const canRemoveMembers = () => {
    if (!id || !user) return false;
    const role = getCurrentRole(id);
    return role === 'PRESIDENT' || role === 'ADMIN';
  };

  // Check if user can change roles (Admin only)
  const canChangeRoles = () => {
    if (!id || !user) return false;
    const role = getCurrentRole(id);
    return role === 'ADMIN';
  };

  const fetchData = async () => {
    if (!backendUrl || !accessToken || !id) {
      return;
    }

    try {
      setLoading(true);
      
      // Fetch members
      const membersResponse = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/management/members`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!membersResponse.ok) {
        throw new Error('Failed to fetch members');
      }

      const membersData = await membersResponse.json();
      setMembers(membersData.members);
      setTotalMembers(membersData.totalMembers);
      setDataLoaded(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!id || !selectedMember) return;
    
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/management/remove-user`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: selectedMember.userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      toast.success(`${selectedMember.name} has been removed from the organization`);
      setRemoveDialogOpen(false);
      setSelectedMember(null);
      fetchData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error("Failed to remove member");
    }
  };

  const handleChangeRole = async () => {
    if (!id || !selectedMember || !newRole) return;
    
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/management/change-role`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: selectedMember.userId, newRole }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to change role');
      }

      toast.success(`${selectedMember.name}'s role has been changed to ${newRole}`);
      setRoleDialogOpen(false);
      setSelectedMember(null);
      setNewRole("");
      fetchData();
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error("Failed to change role");
    }
  };

  const handleTransferPresidency = async () => {
    if (!id || !selectedMember) return;
    
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/management/transfer-presidency`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPresidentUserId: selectedMember.userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to transfer presidency');
      }

      const result = await response.json();
      toast.success(`Presidency transferred to ${selectedMember.name}. Redirecting to dashboard...`);
      setTransferDialogOpen(false);
      setSelectedMember(null);
      // Navigate to dashboard as user's role has changed
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Error transferring presidency:', error);
      toast.error("Failed to transfer presidency");
    }
  };

  // Filter members based on search and filters
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "verified" && member.isVerified) ||
      (statusFilter === "unverified" && !member.isVerified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button variant="ghost" size="icon" onClick={() => navigate(`/organization/${id}`)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Members</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6 flex flex-col flex-1">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{organization?.name} Members</h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Verified members of this organization ({totalMembers} total)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!dataLoaded && (
                    <Button onClick={fetchData} disabled={loading} className="w-full sm:w-auto">
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Load Data
                    </Button>
                  )}
                  {isPresident() && (
                    <Button 
                      onClick={() => setTransferDialogOpen(true)}
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Crown className="h-4 w-4" />
                      <span className="hidden sm:inline">Transfer Presidency</span>
                      <span className="sm:hidden">Transfer</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 mx-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Role</Label>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="PRESIDENT">President</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MODERATOR">Moderator</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {!dataLoaded ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Click "Load Data" to view organization members</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No verified members found
              </div>
            ) : (
              <div className="-mx-6 flex-1 flex flex-col">
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <TableContainer sx={{ flex: 1, minHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ minWidth: 170 }}>Name</TableCell>
                          <TableCell style={{ minWidth: 200 }}>Email</TableCell>
                          <TableCell style={{ minWidth: 120 }}>Role</TableCell>
                          <TableCell style={{ minWidth: 120 }}>Joined</TableCell>
                          <TableCell style={{ minWidth: 100 }}>Status</TableCell>
                          {canChangeRoles() && <TableCell style={{ minWidth: 150 }} align="right">Change Role</TableCell>}
                          {canRemoveMembers() && <TableCell style={{ minWidth: 150 }} align="right">Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMembers
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((member) => (
                          <TableRow hover key={member.userId}>
                            <TableCell style={{ fontWeight: 500 }}>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{member.role}</Badge>
                            </TableCell>
                            <TableCell style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {member.isVerified && (
                                <Badge variant="default" className="bg-green-500">
                                  Verified
                                </Badge>
                              )}
                            </TableCell>
                            {canChangeRoles() && (
                              <TableCell align="right">
                                {member.role !== 'PRESIDENT' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setNewRole(member.role);
                                      setRoleDialogOpen(true);
                                    }}
                                  >
                                    <UserCog className="h-3.5 w-3.5 mr-1" />
                                    Change Role
                                  </Button>
                                )}
                              </TableCell>
                            )}
                            {canRemoveMembers() && (
                              <TableCell align="right">
                                {(member.role === 'MEMBER' || member.role === 'MODERATOR') && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setRemoveDialogOpen(true);
                                    }}
                                    className="gap-1.5"
                                  >
                                    <UserMinus className="h-3.5 w-3.5" />
                                    Remove
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredMembers.length}
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

      {/* Remove Member Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {selectedMember?.name} from this organization? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedMember(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveMember}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Member Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Member: {selectedMember?.name}</Label>
              </div>
              <div>
                <Label htmlFor="role">New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setRoleDialogOpen(false);
                  setSelectedMember(null);
                  setNewRole("");
                }}>
                  Cancel
                </Button>
                <Button onClick={handleChangeRole} disabled={!newRole || newRole === selectedMember?.role}>
                  Change Role
                </Button>
              </div>
            </div>
          </DialogContent>
      </Dialog>

      {/* Transfer Presidency Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Presidency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Select a member to transfer the presidency to. You will become an Admin after the transfer.
              </p>
              <div>
                <Label>Select New President</Label>
                <Select 
                  value={selectedMember?.userId || ""} 
                  onValueChange={(userId) => {
                    const member = members.find(m => m.userId === userId);
                    setSelectedMember(member || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members
                      .filter(m => m.role !== 'PRESIDENT')
                      .map(member => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setTransferDialogOpen(false);
                  setSelectedMember(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleTransferPresidency} 
                  disabled={!selectedMember}
                  variant="default"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Transfer Presidency
                </Button>
              </div>
            </div>
          </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganizationMembers;
