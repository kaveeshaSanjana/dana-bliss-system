import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, PlayCircle, FileText, ArrowLeft, Video, ExternalLink, Plus, Pencil, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateLectureForm } from "@/components/forms/CreateLectureForm";
import { UpdateLectureForm } from "@/components/forms/UpdateLectureForm";
import { useUserRole } from "@/hooks/useUserRole";
import { getLectures } from "@/services/api";
import { toast } from "sonner";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

interface Lecture {
  lectureId: string;
  title: string;
  description: string;
  venue: string;
  mode: string;
  timeStart: string;
  timeEnd: string;
  liveLink: string | null;
  liveMode: string | null;
  recordingUrl: string | null;
  isPublic: boolean;
  documents: Array<{
    documentationId: string;
    title: string;
    description: string;
    docUrl: string;
  }>;
  documentCount: number;
}

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getCurrentRole } = useUserRole();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLectures, setTotalLectures] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // Get course info from localStorage or state management
  const [course, setCourse] = useState<any>(null);
  
  // Check if user can create/update lectures (President, Admin, Moderator)
  const canManageLecture = () => {
    if (!course?.organizationId || !user) return false;
    const role = getCurrentRole(course.organizationId);
    return role === 'PRESIDENT' || role === 'ADMIN' || role === 'MODERATOR';
  };

  useEffect(() => {
    // Try to get course info from localStorage (set when navigating from organization courses)
    const storedCourse = localStorage.getItem('currentCourse');
    if (storedCourse) {
      setCourse(JSON.parse(storedCourse));
    }
  }, [id]);

  const fetchLectures = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getLectures(id, page + 1, rowsPerPage);
      setLectures(data.data);
      setTotalLectures(data.pagination.totalCount);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast.error('Failed to load lectures');
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

  // Convert YouTube or Drive URL to embeddable format
  const getEmbedUrl = (url: string): string => {
    // YouTube formats
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Google Drive format
    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/file/d/')[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  const handleVideoClick = (url: string) => {
    setCurrentVideoUrl(getEmbedUrl(url));
    setVideoDialogOpen(true);
  };
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">{/* Fixed height, no scroll */}
        <AppSidebar 
          variant="course"
          currentOrganization={course?.organizationId ? { id: course.organizationId, name: '' } : undefined}
          currentCourse={course ? { id: course.id, name: course.title } : undefined}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">{/* No scroll on main */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              {course?.organizationId && (
                <Button variant="ghost" size="icon" onClick={() => navigate(`/organization/${course.organizationId}/courses`)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-lg font-semibold">Lectures</h1>
            </div>
          </header>

          <div className="p-4 sm:p-6 flex flex-col flex-1 overflow-hidden">{/* Container no scroll */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{course?.title || 'Course'} - Lectures</h2>
                <p className="text-sm sm:text-base text-muted-foreground">Course content and materials</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!dataLoaded && (
                  <Button onClick={fetchLectures} disabled={loading} className="w-full sm:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Load Data
                  </Button>
                )}
                {canManageLecture() && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Lecture
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                      <DialogTitle>Create New Lecture</DialogTitle>
                    </DialogHeader>
                    <CreateLectureForm
                      causeId={id!}
                      onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        fetchLectures();
                      }}
                      onCancel={() => setIsCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>

            {!dataLoaded ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Click "Load Data" to view course lectures</p>
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : lectures.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No lectures available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="-mx-6 flex-1 flex flex-col overflow-hidden">
                <Paper sx={{ width: '100%', height: '100%', borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <TableContainer sx={{ flex: 1, overflow: 'auto' }}>{/* Only table scrolls */}
                    <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ minWidth: 50 }}>#</TableCell>
                        <TableCell style={{ minWidth: 200 }}>Title</TableCell>
                        <TableCell style={{ minWidth: 150 }}>Date & Time</TableCell>
                        <TableCell style={{ minWidth: 120 }}>Venue</TableCell>
                        <TableCell style={{ minWidth: 100 }}>Mode</TableCell>
                        <TableCell style={{ minWidth: 100 }}>Status</TableCell>
                        <TableCell style={{ minWidth: 120 }}>Meeting</TableCell>
                        <TableCell style={{ minWidth: 120 }}>Recording</TableCell>
                        <TableCell style={{ minWidth: 120 }}>Docs</TableCell>
                        <TableCell style={{ minWidth: 80 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lectures.map((lecture, index) => (
                        <TableRow hover key={lecture.lectureId}>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div style={{ fontWeight: 500, marginBottom: '4px' }}>{lecture.title}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                {lecture.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell style={{ fontSize: '0.875rem' }}>
                            <div>{new Date(lecture.timeStart).toLocaleDateString()}</div>
                            <div style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(lecture.timeStart).toLocaleTimeString()} - {new Date(lecture.timeEnd).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell style={{ fontSize: '0.875rem' }}>
                            {lecture.venue || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{lecture.mode}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lecture.isPublic ? "secondary" : "outline"}>
                              {lecture.isPublic ? "Public" : "Private"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {lecture.liveLink ? (
                              <Button 
                                size="sm" 
                                className="bg-[hsl(var(--lecture-live))] text-[hsl(var(--lecture-live-foreground))] hover:bg-[hsl(var(--lecture-live))]/90"
                                asChild
                              >
                                <a href={lecture.liveLink} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-1" />
                                  Live
                                </a>
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lecture.recordingUrl ? (
                              <Button 
                                size="sm"
                                className="bg-[hsl(var(--lecture-recording))] text-[hsl(var(--lecture-recording-foreground))] hover:bg-[hsl(var(--lecture-recording))]/90"
                                onClick={() => handleVideoClick(lecture.recordingUrl!)}
                              >
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Recording
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lecture.documents && lecture.documents.length > 0 ? (
                              <div>
                                <Button 
                                  size="sm"
                                  className="bg-[hsl(var(--lecture-documents))] text-[hsl(var(--lecture-documents-foreground))] hover:bg-[hsl(var(--lecture-documents))]/90"
                                  onClick={() => {
                                    const newExpanded = new Set(expandedDocuments);
                                    if (expandedDocuments.has(lecture.lectureId)) {
                                      newExpanded.delete(lecture.lectureId);
                                    } else {
                                      newExpanded.add(lecture.lectureId);
                                    }
                                    setExpandedDocuments(newExpanded);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Docs ({lecture.documentCount})
                                </Button>
                                {expandedDocuments.has(lecture.lectureId) && (
                                  <div className="mt-2 space-y-1">
                                    {lecture.documents.map((doc) => (
                                      <a 
                                        key={doc.documentationId}
                                        href={doc.docUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-1 rounded text-sm hover:bg-muted"
                                      >
                                        <FileText className="h-3 w-3" />
                                        <span className="flex-1 truncate">{doc.title}</span>
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {canManageLecture() && (
                              <Button 
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLecture(lecture);
                                  setIsUpdateDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalLectures}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </Paper>
              </div>
            )}
          </div>

          {/* Update Lecture Dialog */}
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Lecture</DialogTitle>
              </DialogHeader>
              {selectedLecture && (
                <UpdateLectureForm
                  lecture={selectedLecture}
                  onSuccess={() => {
                    setIsUpdateDialogOpen(false);
                    setSelectedLecture(null);
                    fetchLectures();
                  }}
                  onCancel={() => {
                    setIsUpdateDialogOpen(false);
                    setSelectedLecture(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Video Player Dialog */}
          <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
            <DialogContent className="max-w-7xl w-[95vw] p-0 bg-black border-none">
              <div className="relative w-full pt-[56.25%] bg-black">{/* 16:9 aspect ratio */}
                {currentVideoUrl && (
                  <iframe
                    src={currentVideoUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CourseDetail;
