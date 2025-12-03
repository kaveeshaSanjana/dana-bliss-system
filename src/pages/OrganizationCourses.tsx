import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Loader2, Plus } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateCourseForm } from "@/components/forms/CreateCourseForm";

interface Cause {
  causeId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  introVideoUrl: string | null;
  isPublic: boolean;
  organizationId: string;
}

const OrganizationCourses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization } = useOutletContext<{ organization: { id: string; name: string } | null }>();
  const { backendUrl, accessToken, user, getCurrentRole } = useUserRole();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const limit = 10;

  // Check if user can create courses (President, Admin only - NOT Moderator)
  const canCreateCourse = () => {
    if (!id || !user) return false;
    const role = getCurrentRole(id);
    return role === 'PRESIDENT' || role === 'ADMIN';
  };

  const fetchData = async () => {
    if (!backendUrl || !accessToken || !id) {
      return;
    }

    try {
      setLoading(true);
      
      // Fetch causes
      const causesResponse = await fetch(
        `${backendUrl}/organization/api/v1/organizations/${id}/causes?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!causesResponse.ok) {
        throw new Error('Failed to fetch causes');
      }

      const causesData = await causesResponse.json();
      setCauses(causesData.data);
      setTotalPages(causesData.pagination.totalPages);
      setDataLoaded(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
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
              <h1 className="text-lg font-semibold">Courses</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{organization?.name} Courses</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Available courses in this organization</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!dataLoaded && (
                  <Button onClick={fetchData} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Load Data
                  </Button>
                )}
                {canCreateCourse() && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                      <DialogTitle>Create New Course</DialogTitle>
                    </DialogHeader>
                    <CreateCourseForm
                      organizationId={id!}
                      onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        toast.success('Course created successfully');
                        setPage(1);
                        fetchData();
                      }}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>

            {!dataLoaded ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Click "Load Data" to view available courses</p>
              </div>
            ) : causes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No courses available in this organization
              </div>
            ) : (
              <>
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {causes.map((cause) => (
                    <div key={cause.causeId} className="relative flex flex-col rounded-xl bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg">
                        {cause.imageUrl ? (
                          <img 
                            src={cause.imageUrl} 
                            alt={cause.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-primary-foreground opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h5 className="mb-2 font-sans text-xl font-semibold leading-snug tracking-normal text-foreground">
                          {cause.title}
                        </h5>
                        <p className="font-sans text-base font-light leading-relaxed text-muted-foreground line-clamp-3">
                          {cause.description}
                        </p>
                      </div>
                      <div className="p-6 pt-0 mt-auto">
                        <Button 
                          className="w-full"
                          onClick={() => {
                            localStorage.setItem('currentCourse', JSON.stringify({
                              id: cause.causeId,
                              title: cause.title,
                              organizationId: id,
                            }));
                            navigate(`/course/${cause.causeId}`);
                          }}
                        >
                          Select Course
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
  );
};

export default OrganizationCourses;
