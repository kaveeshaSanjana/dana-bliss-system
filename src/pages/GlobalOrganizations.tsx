import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft, Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { getNotEnrolledOrganizations, enrollInOrganization } from "@/services/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GlobalOrganization {
  organizationId: string;
  name: string;
  type: string;
  isPublic: boolean;
  needEnrollmentVerification: boolean;
  enabledEnrollments: boolean;
  imageUrl: string;
  instituteId: string;
  createdAt: string;
  enrollmentStatus: string;
  canEnroll: boolean;
}

const GlobalOrganizations = () => {
  const navigate = useNavigate();
  const { backendUrl, accessToken } = useUserRole();
  const [organizations, setOrganizations] = useState<GlobalOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrollDialog, setEnrollDialog] = useState<{ open: boolean; org: GlobalOrganization | null }>({
    open: false,
    org: null,
  });
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const limit = 10;

  const fetchGlobalOrganizations = async () => {
    if (!backendUrl || !accessToken) return;
    
    setLoading(true);
    try {
      const result = await getNotEnrolledOrganizations(page, limit);
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

  const handleEnrollClick = (org: GlobalOrganization) => {
    if (!org.canEnroll) {
      toast.error("Enrollment is not enabled for this organization");
      return;
    }
    
    setEnrollDialog({ open: true, org });
    setEnrollmentKey("");
  };

  const handleEnrollSubmit = async () => {
    if (!enrollDialog.org) return;

    const org = enrollDialog.org;
    
    // For public organizations, enrollment key is optional
    if (!org.isPublic && !enrollmentKey.trim()) {
      toast.error("Enrollment key is required for non-public organizations");
      return;
    }

    setEnrolling(true);
    try {
      await enrollInOrganization(org.organizationId, enrollmentKey);
      toast.success(
        org.needEnrollmentVerification
          ? "Enrollment request submitted. Awaiting verification."
          : "Successfully enrolled in organization!"
      );
      setEnrollDialog({ open: false, org: null });
      setEnrollmentKey("");
      fetchGlobalOrganizations();
    } catch (error) {
      toast.error("Failed to enroll in organization");
      console.error(error);
    } finally {
      setEnrolling(false);
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
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Global Organizations</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Global Organizations</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Discover and enroll in available organizations</p>
              </div>
              {!dataLoaded && (
                <Button onClick={fetchGlobalOrganizations} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Load Data
                </Button>
              )}
            </div>

            {!dataLoaded ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Click "Load Data" to discover available organizations</p>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No available organizations found</p>
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
                        <div className="space-y-1">
                          <p className="font-sans text-base font-light leading-relaxed text-muted-foreground">
                            {org.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {org.isPublic ? "Public" : "Private"} • {org.needEnrollmentVerification ? "Requires verification" : "Instant enrollment"}
                          </p>
                        </div>
                      </div>
                      <div className="p-6 pt-0 mt-auto">
                        <Button 
                          className="w-full"
                          onClick={() => handleEnrollClick(org)}
                          disabled={!org.canEnroll || !org.enabledEnrollments}
                        >
                          {!org.enabledEnrollments ? "Enrollment Disabled" : "Enroll"}
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

      <Dialog open={enrollDialog.open} onOpenChange={(open) => setEnrollDialog({ open, org: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {enrollDialog.org?.name}</DialogTitle>
            <DialogDescription>
              {enrollDialog.org?.isPublic 
                ? "This is a public organization. You can enroll directly or provide an enrollment key if you have one."
                : "Please enter the enrollment key to proceed with enrollment."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="enrollmentKey">
                Enrollment Key {enrollDialog.org?.isPublic && "(Optional)"}
              </Label>
              <Input
                id="enrollmentKey"
                placeholder="Enter enrollment key"
                value={enrollmentKey}
                onChange={(e) => setEnrollmentKey(e.target.value)}
                disabled={enrolling}
              />
            </div>
            {enrollDialog.org?.needEnrollmentVerification && (
              <p className="text-sm text-muted-foreground">
                Note: Your enrollment will require verification by an administrator.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEnrollDialog({ open: false, org: null })}
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button onClick={handleEnrollSubmit} disabled={enrolling}>
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default GlobalOrganizations;
