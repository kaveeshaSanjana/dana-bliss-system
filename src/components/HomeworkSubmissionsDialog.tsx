import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { AccessControl, UserRole } from '@/utils/permissions';
import { homeworkSubmissionsApi, type HomeworkSubmission } from '@/api/homeworkSubmissions.api';
import { FileText, Calendar, User, ExternalLink, RefreshCw, Lock } from 'lucide-react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

interface HomeworkSubmissionsDialogProps {
  homework: any;
  isOpen: boolean;
  onClose: () => void;
}

const HomeworkSubmissionsDialog = ({ homework, isOpen, onClose }: HomeworkSubmissionsDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userRole = useInstituteRole();
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadSubmissions = async () => {
    if (!homework?.id) return;

    setIsLoading(true);
    try {
      const response = await homeworkSubmissionsApi.getSubmissions({
        homeworkId: homework.id,
        page: 1,
        limit: 50,
        userId: user?.id,
        role: userRole,
        instituteId: homework.instituteId,
        classId: homework.classId,
        subjectId: homework.subjectId
      }, true);

      const submissionsList = Array.isArray(response) ? response : response.data || [];
      setSubmissions(submissionsList);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load homework submissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && homework?.id) {
      loadSubmissions();
    }
  }, [isOpen, homework?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Check if user has permission to view homework submissions
  if (!AccessControl.hasPermission(userRole, 'view-homework-submissions')) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Denied
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              You don't have permission to view homework submissions. Only teachers and institute administrators can access this feature.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Homework Submissions: {homework?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Homework Info */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">{homework?.title}</h3>
            <p className="text-muted-foreground mb-2">{homework?.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {homework?.startDate && (
                <span>Start: {new Date(homework.startDate).toLocaleDateString()}</span>
              )}
              {homework?.endDate && (
                <span>Due: {new Date(homework.endDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Submissions ({submissions.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubmissions}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          {/* Submissions Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground">No students have submitted this homework yet.</p>
            </div>
          ) : (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="homework submissions table">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ minWidth: 170 }}>Student Name</TableCell>
                      <TableCell style={{ minWidth: 100 }}>Status</TableCell>
                      <TableCell style={{ minWidth: 170 }}>Submission Date</TableCell>
                      <TableCell style={{ minWidth: 200 }}>Remarks</TableCell>
                      <TableCell style={{ minWidth: 150 }}>Submitted File</TableCell>
                      <TableCell style={{ minWidth: 150 }}>Teacher Correction</TableCell>
                      <TableCell style={{ minWidth: 170 }}>Created/Updated</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((submission) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={submission.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">
                                  {submission.student?.firstName} {submission.student?.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={submission.isActive ? 'default' : 'secondary'}>
                                {submission.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                {formatDate(submission.submissionDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {submission.remarks ? (
                                <p className="text-sm line-clamp-2">{submission.remarks}</p>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.fileUrl ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(submission.fileUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View File
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {submission.teacherCorrectionFileUrl ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(submission.teacherCorrectionFileUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Correction
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div>Created: {formatDate(submission.createdAt)}</div>
                                {submission.updatedAt !== submission.createdAt && (
                                  <div>Updated: {formatDate(submission.updatedAt)}</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={submissions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeworkSubmissionsDialog;