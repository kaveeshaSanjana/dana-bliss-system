import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import ApiService from '@/services/api';
import { CreateClassModal } from '@/components/CreateClassModal';
import { UploadClassImageModal } from '@/components/UploadClassImageModal';

export default function ClassManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const { toast } = useToast();

  const loadClasses = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await ApiService.getClasses(page, 10);
      setClasses(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleClassCreated = () => {
    loadClasses(1);
  };

  const handleImageUploaded = () => {
    loadClasses(currentPage);
    setSelectedClass(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>Manage institute classes in the system</CardDescription>
          </div>
          <CreateClassModal onClassCreated={handleClassCreated} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Institute</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.code}</TableCell>
                  <TableCell>{cls.instituteName || 'N/A'}</TableCell>
                  <TableCell>{cls.grade || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={cls.isActive ? "default" : "secondary"}>
                      {cls.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => loadClasses(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => loadClasses(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <UploadClassImageModal
          classData={selectedClass}
          onClose={() => setSelectedClass(null)}
          onImageUploaded={handleImageUploaded}
        />
      )}
    </div>
  );
}
