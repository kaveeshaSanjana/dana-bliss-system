import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import InstituteCarousel from '@/components/dashboard/InstituteCarousel';
import DashboardClassCards from '@/components/dashboard/DashboardClassCards';
import DashboardSubjectCards from '@/components/dashboard/DashboardSubjectCards';
import DashboardQuickNav from '@/components/dashboard/DashboardQuickNav';
import MyAttendanceHistoryCard from '@/components/dashboard/MyAttendanceHistoryCard';
import DashboardChildrenCard from '@/components/dashboard/DashboardChildrenCard';
import DashboardStatCards from '@/components/dashboard/DashboardStatCards';
import { useNavigate } from 'react-router-dom';
import { buildSidebarUrl } from '@/utils/pageNavigation';
import { ClipboardCheck } from 'lucide-react';

const DesktopDashboard = () => {
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

  const showChildrenCard = userRole === 'Parent' || (user?.userType?.toUpperCase() !== 'USER_WITHOUT_PARENT');

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Welcome{user?.firstName || user?.nameWithInitials ? `, ${user?.firstName || user?.nameWithInitials}` : ''} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedInstitute
            ? selectedInstitute.shortName || selectedInstitute.name
            : 'Select an institute to get started'}
        </p>
      </div>

      {/* Institute horizontal scroll chips */}
      <InstituteCarousel onSelectInstitute={(inst) => setSelectedInstitute(inst)} />

      {/* Stat summary cards */}
      <DashboardStatCards />

      {/* Class cards — show after institute is selected */}
      {selectedInstitute && (
        <DashboardClassCards />
      )}

      {/* Subject cards — show after class is selected */}
      {selectedInstitute && selectedClass && !selectedSubject && (
        <DashboardSubjectCards />
      )}

      {/* Breadcrumb navigation */}
      {selectedInstitute && (
        <DashboardQuickNav onNavigate={handleNavigate} isTuitionInstitute={isTuitionInstitute} />
      )}

      {/* Mark Attendance button — visible for non-Student/Parent roles */}
      {selectedInstitute && userRole !== 'Student' && userRole !== 'Parent' && (
        <button
          onClick={() => handleNavigate('institute-mark-attendance')}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <ClipboardCheck className="h-5 w-5" />
          Mark Attendance
        </button>
      )}

      {/* Widget cards — Attendance, Children */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MyAttendanceHistoryCard />
        {showChildrenCard && <DashboardChildrenCard />}
      </div>
    </div>
  );
};

export default DesktopDashboard;
