import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export function SubjectDetailsModal({ isOpen, onClose, subject }: SubjectDetailsModalProps) {
  if (!subject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subject Details</DialogTitle>
          <DialogDescription>Complete information about the subject</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {subject.imgUrl && (
            <div className="flex justify-center">
              <img 
                src={subject.imgUrl} 
                alt={subject.name}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Subject Code</h4>
                <p className="text-sm font-mono">{subject.code}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Subject Name</h4>
                <p className="text-sm">{subject.name}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                <Badge variant="outline" className="text-xs">
                  {subject.category}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Credit Hours</h4>
                <p className="text-sm">{subject.creditHours}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                <Badge className={subject.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                  {subject.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Subject Type</h4>
                <Badge variant="secondary" className="text-xs">
                  {subject.subjectType}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Basket Category</h4>
                <Badge variant="outline" className="text-xs">
                  {subject.basketCategory}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Institute Type</h4>
                <p className="text-sm">{subject.instituteType}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Created At</h4>
                <p className="text-sm">{new Date(subject.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Updated At</h4>
                <p className="text-sm">{new Date(subject.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {subject.description && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{subject.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}