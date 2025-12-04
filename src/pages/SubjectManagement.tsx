import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { CreateSubjectModal } from '@/components/CreateSubjectModal';
import { SubjectDetailsModal } from '@/components/SubjectDetailsModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  subjectType: string;
  basketCategory: string;
  instituteType: string;
  imgUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubjectManagement() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = subjects.filter((subject) =>
      (subject.name ?? '').toLowerCase().includes(q) ||
      (subject.code ?? '').toLowerCase().includes(q) ||
      (subject.category ?? '').toLowerCase().includes(q)
    );
    setFilteredSubjects(filtered);
  }, [subjects, searchQuery]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getSubjects();
      setSubjects(response);
    } catch (error: any) {
      toast({ title: 'Failed to load subjects', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Subject Management</h2>
        <p className="text-muted-foreground">Manage academic subjects and curriculum</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Subject
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No subjects found' : 'No subjects available'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by creating your first subject.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Subject
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Basket Category</TableHead>
                  <TableHead>Subject Type</TableHead>
                  <TableHead>Institute Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      {subject.imgUrl ? (
                        <img 
                          src={subject.imgUrl} 
                          alt={subject.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {subject.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {subject.basketCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {subject.subjectType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {subject.instituteType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={subject.isActive ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {subject.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewSubject(subject)}
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
      </div>

      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadSubjects}
      />

      <SubjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}