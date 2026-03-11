import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { instituteApi } from '@/api/institute.api';
import { BookOpen, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import type { Subject } from '@/contexts/types/auth.types';

const DashboardSubjectCards = () => {
  const { selectedInstitute, selectedClass, selectedSubject, setSelectedSubject, user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef<string | null>(null);

  const cacheKey = `${selectedInstitute?.id}-${selectedClass?.id}`;

  useEffect(() => {
    if (!selectedInstitute?.id || !selectedClass?.id) return;
    if (hasLoadedRef.current === cacheKey) return;
    hasLoadedRef.current = cacheKey;

    let cancelled = false;
    setSubjects([]);
    setLoading(true);

    const load = async () => {
      try {
        const result = await instituteApi.getClassSubjects(
          selectedInstitute.id,
          selectedClass.id,
          { userId: user?.id, role: selectedInstitute.userRole }
        );
        if (cancelled) return;
        const data = (result as any)?.data || result || [];
        setSubjects(Array.isArray(data) ? data : []);
      } catch (e) {
        if (cancelled) return;
        console.error('Failed to load subjects:', e);
        setSubjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => { cancelled = true; };
  }, [cacheKey]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  const handleSelect = (subj: any) => {
    setSelectedSubject({
      id: subj.id,
      name: subj.name || subj.subjectName,
      ...subj,
    } as Subject);
  };

  const isTuition = selectedInstitute?.type === 'tuition_institute';
  const label = isTuition ? 'Sub Classes' : 'Subjects';

  if (!selectedInstitute || !selectedClass) return null;

  if (loading) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {label}
          </h3>
        </div>
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 w-32 rounded-xl bg-muted animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <BookOpen className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1.5" />
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          {label}
          <span className="text-xs font-normal text-muted-foreground">({subjects.length})</span>
        </h3>
        {subjects.length > 3 && (
          <div className="flex gap-1">
            <button onClick={() => scroll('left')} className="w-6 h-6 rounded-full bg-muted/80 border border-border flex items-center justify-center hover:bg-accent transition-colors">
              <ChevronLeft className="h-3 w-3 text-foreground" />
            </button>
            <button onClick={() => scroll('right')} className="w-6 h-6 rounded-full bg-muted/80 border border-border flex items-center justify-center hover:bg-accent transition-colors">
              <ChevronRight className="h-3 w-3 text-foreground" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-1"
      >
        {subjects.map((subj) => {
          const isSelected = selectedSubject?.id === subj.id;
          const subjectName = subj.name || subj.subjectName || 'Unnamed';

          return (
            <button
              key={subj.id}
              onClick={() => handleSelect(subj)}
              className={`
                relative flex flex-col items-start p-3 rounded-xl shrink-0
                min-w-[120px] max-w-[170px] border
                active:scale-[0.97] text-left
                ${isSelected
                  ? 'bg-violet-500/10 border-violet-500/30 shadow-sm ring-1 ring-violet-500/20'
                  : 'bg-card border-border hover:border-violet-500/20 hover:bg-accent/50'
                }
              `}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                isSelected
                  ? 'bg-violet-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <BookOpen className="h-4 w-4" />
              </div>
              <p className={`text-sm font-semibold truncate w-full leading-tight ${
                isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'
              }`}>
                {subjectName}
              </p>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSubjectCards;
