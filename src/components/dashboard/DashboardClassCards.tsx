import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { instituteApi } from '@/api/institute.api';
import { School, ChevronRight, ChevronLeft, Loader2, BookOpen } from 'lucide-react';
import type { Class } from '@/contexts/types/auth.types';

const DashboardClassCards = () => {
  const { selectedInstitute, selectedClass, setSelectedClass, user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedInstitute?.id) return;

    // If already loaded for this institute, skip
    if (hasLoadedRef.current === selectedInstitute.id) return;
    hasLoadedRef.current = selectedInstitute.id;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await instituteApi.getInstituteClasses(selectedInstitute.id, {
          userId: user?.id,
          role: selectedInstitute.userRole,
        });
        if (cancelled) return;
        const data = (result as any)?.data || result || [];
        setClasses(Array.isArray(data) ? data : []);
      } catch (e) {
        if (cancelled) return;
        console.error('Failed to load classes:', e);
        setClasses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => { cancelled = true; };
  }, [selectedInstitute?.id]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  const handleSelect = (cls: any) => {
    setSelectedClass({
      id: cls.id,
      name: cls.name || cls.className,
      grade: cls.grade,
      ...cls,
    } as Class);
  };

  if (!selectedInstitute) return null;

  if (loading) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <School className="h-4 w-4 text-primary" />
            Classes
          </h3>
        </div>
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 w-36 rounded-xl bg-muted animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <School className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1.5" />
        <p className="text-sm text-muted-foreground">No classes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <School className="h-4 w-4 text-primary" />
          Classes
          <span className="text-xs font-normal text-muted-foreground">({classes.length})</span>
        </h3>
        {classes.length > 3 && (
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
        {classes.map((cls) => {
          const isSelected = selectedClass?.id === cls.id;
          const className = cls.name || cls.className || 'Unnamed';
          const subjectCount = cls.subjectCount || cls.subjects?.length || 0;

          return (
            <button
              key={cls.id}
              onClick={() => handleSelect(cls)}
              className={`
                relative flex flex-col items-start p-3 rounded-xl shrink-0
                min-w-[130px] max-w-[180px] border
                active:scale-[0.97] text-left
                ${isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-card border-border hover:border-emerald-500/20 hover:bg-accent/50'
                }
              `}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                isSelected
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <School className="h-4 w-4" />
              </div>
              <p className={`text-sm font-semibold truncate w-full leading-tight ${
                isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'
              }`}>
                {className}
              </p>
              {subjectCount > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <BookOpen className="h-2.5 w-2.5" />
                  {subjectCount} subjects
                </p>
              )}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
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

export default DashboardClassCards;
