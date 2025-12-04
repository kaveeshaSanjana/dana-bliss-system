import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock, ExternalLink } from 'lucide-react';
import ApiService from '@/services/api';

interface Lecture {
  id: string;
  title: string;
  description: string;
  grade: number;
  lessonNumber: number;
  lectureNumber: number;
  provider: string;
  lectureLink: string;
  documents: Array<{
    name: string;
    url: string;
  }>;
  isActive: boolean;
  subject?: {
    name: string;
    code: string;
  };
}

const InstituteLectures = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitute] = useState('Bayya napuwava'); // This would come from user context

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getLectures();
        setLectures(response.data || []);
      } catch (error: any) {
        console.error('Error fetching lectures:', error);
        // Silently handle 403 errors (permission denied) - user doesn't have access
        if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
          setLectures([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Current Selection Header */}
      <div className="bg-card p-4 rounded-lg border">
        <div className="text-sm text-muted-foreground mb-1">Current Selection</div>
        <div className="text-lg font-semibold text-foreground">
          Institute: {selectedInstitute}
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institute Lectures</h1>
          <p className="text-muted-foreground mt-2">
            Access lectures available for your institute
          </p>
        </div>
      </div>

      {/* Lectures Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lectures.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Lectures Available</h3>
            <p className="text-muted-foreground">
              There are no lectures available for your institute at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{lecture.title}</CardTitle>
                  <Badge variant={lecture.isActive ? "default" : "secondary"}>
                    {lecture.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {lecture.subject && (
                  <p className="text-sm text-muted-foreground">
                    {lecture.subject.name} ({lecture.subject.code})
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lecture.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Grade {lecture.grade}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    L{lecture.lessonNumber}.{lecture.lectureNumber}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {lecture.provider}
                  </Badge>
                </div>

                {lecture.documents && lecture.documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Documents:</p>
                    {lecture.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {doc.name}
                      </a>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(lecture.lectureLink, '_blank')}
                    disabled={!lecture.isActive}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access Lecture
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstituteLectures;