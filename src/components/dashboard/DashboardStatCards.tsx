import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { School, UserCheck, Calendar, BookOpen } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const DashboardStatCards = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const userRole = useInstituteRole();

  const cards: StatCard[] = [];

  // Always show institutes count
  const totalInstitutes = user?.institutes?.length || 0;
  cards.push({
    label: 'Institutes',
    value: totalInstitutes,
    icon: <School className="h-6 w-6" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  });

  if (selectedInstitute) {
    cards.push({
      label: 'Role',
      value: userRole || '—',
      icon: <UserCheck className="h-6 w-6" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    });
  }

  if (selectedClass) {
    cards.push({
      label: 'Class',
      value: selectedClass.name?.slice(0, 15) || '—',
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/10',
    });
  }

  if (selectedSubject) {
    cards.push({
      label: 'Subject',
      value: selectedSubject.name?.slice(0, 15) || '—',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <span className="text-xl font-bold text-foreground truncate">{card.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatCards;
