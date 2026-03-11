import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { useNavigate } from 'react-router-dom';
import { buildSidebarUrl } from '@/utils/pageNavigation';
import InstituteCarousel from '@/components/dashboard/InstituteCarousel';
import DashboardClassCards from '@/components/dashboard/DashboardClassCards';
import DashboardSubjectCards from '@/components/dashboard/DashboardSubjectCards';
import DashboardQuickNav from '@/components/dashboard/DashboardQuickNav';
import MyAttendanceHistoryCard from '@/components/dashboard/MyAttendanceHistoryCard';
import DashboardChildrenCard from '@/components/dashboard/DashboardChildrenCard';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import {
  Video, Notebook, Award, CalendarDays, Calendar,
  BookOpen, ChevronRight, ClipboardCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const MobileDashboard = () => {
  const {
    user, selectedInstitute, selectedClass, selectedSubject,
    selectedChild, selectedOrganization, selectedTransport,
    setSelectedInstitute,
  } = useAuth();
  const userRole = useInstituteRole();
  const navigate = useNavigate();
  const isTuitionInstitute = selectedInstitute?.type === 'tuition_institute';

  const handleNavigate = (itemId: string) => {
    const context = {
      instituteId: selectedInstitute?.id,
      classId: selectedClass?.id,
      subjectId: selectedSubject?.id,
      childId: selectedChild?.id,
      organizationId: selectedOrganization?.id,
      transportId: selectedTransport?.id,
    };
    const url = buildSidebarUrl(itemId, context);
    navigate(url);
  };

  // Quick action buttons — context-aware, focused on what matters NOW
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (selectedInstitute && selectedClass && selectedSubject) {
      // Full context: show content actions
      actions.push({ id: 'lectures', label: 'Lectures', icon: Video, color: 'bg-blue-500' });
      actions.push({ id: 'homework', label: 'Homework', icon: Notebook, color: 'bg-emerald-500' });
      actions.push({ id: 'exams', label: 'Exams', icon: Award, color: 'bg-violet-500' });
      actions.push({ id: 'today-dashboard', label: 'Today', icon: CalendarDays, color: 'bg-amber-500' });
    } else if (selectedInstitute && selectedClass) {
      actions.push({ id: 'today-dashboard', label: 'Today', icon: CalendarDays, color: 'bg-amber-500' });
      actions.push({ id: 'calendar-view', label: 'Calendar', icon: Calendar, color: 'bg-blue-500' });
      if (userRole === 'Student' || userRole === 'Parent') {
        actions.push({ id: 'institute-lectures', label: 'Lectures', icon: Video, color: 'bg-indigo-500' });
      }
    } else if (selectedInstitute) {
      actions.push({ id: 'today-dashboard', label: 'Today', icon: CalendarDays, color: 'bg-amber-500' });
      actions.push({ id: 'calendar-view', label: 'Calendar', icon: Calendar, color: 'bg-blue-500' });
      actions.push({ id: 'institute-lectures', label: 'Lectures', icon: Video, color: 'bg-indigo-500' });
    }

    return actions;
  };

  const quickActions = getQuickActions();
  const showChildrenCard = userRole === 'Parent' || (user?.userType?.toUpperCase() !== 'USER_WITHOUT_PARENT');

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-foreground">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedInstitute
            ? selectedInstitute.shortName || selectedInstitute.name
            : 'Select an institute to get started'}
        </p>
      </div>

      {/* Institute horizontal scroll */}
      <div className="px-1">
        <InstituteCarousel onSelectInstitute={(inst) => setSelectedInstitute(inst)} />
      </div>

      {/* Stat summary cards */}
      <div className="px-1">
        <DashboardStatCards />
      </div>

      {/* Class cards */}
      {selectedInstitute && (
        <div className="px-1">
          <DashboardClassCards />
        </div>
      )}

      {/* Subject cards */}
      {selectedInstitute && selectedClass && !selectedSubject && (
        <div className="px-1">
          <DashboardSubjectCards />
        </div>
      )}

      {/* Breadcrumb navigation */}
      {selectedInstitute && (
        <div className="px-1">
          <DashboardQuickNav onNavigate={handleNavigate} isTuitionInstitute={isTuitionInstitute} />
        </div>
      )}

      {/* Quick Actions - horizontal scroll */}
      {quickActions.length > 0 && (
        <div className="px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Quick Actions
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleNavigate(action.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/50 shrink-0 hover:border-primary/20 active:scale-[0.97] transition-all shadow-sm"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mark Attendance button — visible for non-Student/Parent roles */}
      {selectedInstitute && userRole !== 'Student' && userRole !== 'Parent' && (
        <div className="px-1">
          <button
            onClick={() => handleNavigate('institute-mark-attendance')}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <ClipboardCheck className="h-5 w-5" />
            Mark Attendance
          </button>
        </div>
      )}

      {/* Widget cards */}
      <div className="px-1 space-y-3">
        <MyAttendanceHistoryCard />
        {showChildrenCard && <DashboardChildrenCard />}
      </div>
    </div>
  );
};

export default MobileDashboard;
