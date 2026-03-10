import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { GraduationCap, BookOpen, School, Users, UserCheck, Award } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const DashboardStatCards = () => {
  const { user, selectedInstitute, selectedClass } = useAuth();
  const userRole = useInstituteRole();

  const cards: StatCard[] = [];

  if (selectedInstitute) {
    if (userRole === 'InstituteAdmin' || userRole === 'Teacher') {
      cards.push({
        label: 'Students',
        value: selectedInstitute.totalStudents || '—',
        icon: <GraduationCap className="h-6 w-6" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
      });
      cards.push({
        label: 'Classes',
        value: selectedInstitute.totalClasses || '—',
        icon: <School className="h-6 w-6" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10',
      });
      cards.push({
        label: 'Subjects',
        value: selectedInstitute.totalSubjects || '—',
        icon: <BookOpen className="h-6 w-6" />,
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-500/10',
      });
    }

    if (userRole === 'InstituteAdmin') {
      cards.push({
        label: 'Teachers',
        value: selectedInstitute.totalTeachers || '—',
        icon: <Users className="h-6 w-6" />,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
      });
    }

    if (userRole === 'Student') {
      cards.push({
        label: 'My Classes',
        value: user?.institutes?.find(i => i.id === selectedInstitute.id)?.classes?.length || '—',
        icon: <School className="h-6 w-6" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
      });
      cards.push({
        label: 'Institute',
        value: selectedInstitute.shortName || selectedInstitute.name?.slice(0, 12) || '—',
        icon: <Award className="h-6 w-6" />,
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-500/10',
      });
    }
  }

  if (!selectedInstitute) {
    const totalInstitutes = user?.institutes?.length || 0;
    cards.push({
      label: 'My Institutes',
      value: totalInstitutes,
      icon: <School className="h-6 w-6" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-2xl p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {card.label}
          </p>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
              {card.icon}
            </div>
            <span className="text-2xl font-bold text-foreground">{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatCards;
