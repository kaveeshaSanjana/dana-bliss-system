import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, ArrowLeft, Loader2, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EnrollOrganizationForm } from "@/components/forms/EnrollOrganizationForm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Organization {
  organizationId: string;
  name: string;
  type: string;
  isPublic: boolean;
  needEnrollmentVerification: boolean;
  imageUrl: string;
  instituteId: string;
  userRole: string;
  isVerified: boolean;
  joinedAt: string;
  memberCount: number;
  causeCount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, accessToken, user } = useUserRole();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const limit = 10;

  const fetchEnrolledOrganizations = async () => {
    if (!backendUrl || !accessToken) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/user/enrolled?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch organizations');

      const result = await response.json();
      setOrganizations(result.data);
      setTotalPages(result.pagination.totalPages);
      setDataLoaded(true);
    } catch (error) {
      toast.error('Failed to load organizations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar variant="main" />
        
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">My Organizations</h1>
            </div>
          </header>

          <div className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Enrolled Organizations</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Organizations you're currently part of</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!dataLoaded && (
                  <Button onClick={fetchEnrolledOrganizations} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Load Data
                  </Button>
                )}
                <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-4">
                    <DialogHeader>
                      <DialogTitle>Enroll in Organization</DialogTitle>
                    </DialogHeader>
                    <EnrollOrganizationForm
                      onSuccess={() => {
                        setIsEnrollDialogOpen(false);
                        fetchEnrolledOrganizations();
                      }}
                      onCancel={() => setIsEnrollDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {!dataLoaded ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Click "Load Data" to view your enrolled organizations</p>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No enrolled organizations found</p>
              </div>
            ) : (
              <>
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {organizations.map((org) => (
                    <div key={org.organizationId} className="relative flex flex-col rounded-xl bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg">
                        <img 
                          src={org.imageUrl} 
                          alt={org.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h5 className="mb-2 font-sans text-xl font-semibold leading-snug tracking-normal text-foreground">
                          {org.name}
                        </h5>
                        <p className="font-sans text-base font-light leading-relaxed text-muted-foreground">
                          {org.type} • {org.memberCount} members • {org.causeCount} causes
                        </p>
                      </div>
                      <div className="p-6 pt-0 mt-auto">
                        <Button 
                          className="w-full"
                          onClick={() => navigate(`/organization/${org.organizationId}`)}
                        >
                          Select Organization
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={page === p}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
