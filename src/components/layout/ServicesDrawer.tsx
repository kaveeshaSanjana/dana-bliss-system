import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { useNavigate } from 'react-router-dom';
import { buildSidebarUrl } from '@/utils/pageNavigation';
import {
  User, Building2, CreditCard, IdCard, Settings, Bus,
  MessageSquare, ImageIcon, Users, QrCode, UserCheck,
  Bell, School, BookOpen, GraduationCap, Clock,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ServiceItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

interface ServiceSection {
  title: string;
  items: ServiceItem[];
}

interface ServicesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ServicesDrawer: React.FC<ServicesDrawerProps> = ({ open, onOpenChange }) => {
  const {
    user, selectedInstitute, selectedClass, selectedSubject,
    selectedChild, selectedOrganization, selectedTransport,
  } = useAuth();
  const userRole = useInstituteRole();
  const navigate = useNavigate();
  const isTuitionInstitute = selectedInstitute?.type === 'tuition_institute';
  const subjectLabel = isTuitionInstitute ? 'Sub Class' : 'Subject';

  const handleNavigate = (itemId: string) => {
    const context = {
      instituteId: selectedInstitute?.id,
      classId: selectedClass?.id,
      subjectId: selectedSubject?.id,
      childId: selectedChild?.id,
      organizationId: selectedOrganization?.id,
      transportId: selectedTransport?.id,
    };
    if (itemId === 'organizations' && !selectedInstitute) {
      window.open('https://org.suraksha.lk/', '_blank');
      onOpenChange(false);
      return;
    }
    const url = buildSidebarUrl(itemId, context);
    navigate(url);
    onOpenChange(false);
  };

  const getSections = (): ServiceSection[] => {
    const sections: ServiceSection[] = [];
    const userType = user?.userType?.toUpperCase() || '';

    // Navigation services
    if (selectedInstitute) {
      const navItems: ServiceItem[] = [];
      if (!selectedClass) {
        navItems.push({ id: 'select-class', label: 'Choose Class', icon: School, color: 'bg-emerald-500', description: 'Select your class' });
      }
      if (selectedClass && !selectedSubject) {
        navItems.push({ id: 'select-subject', label: `Choose ${subjectLabel}`, icon: BookOpen, color: 'bg-violet-500', description: `Pick a ${subjectLabel.toLowerCase()}` });
      }
      if (navItems.length > 0) {
        sections.push({ title: 'Navigate', items: navItems });
      }
    }

    // People management (Admin/Teacher)
    if (selectedInstitute && (userRole === 'InstituteAdmin' || userRole === 'Teacher')) {
      const peopleItems: ServiceItem[] = [];
      if (userRole === 'InstituteAdmin') {
        if (!isTuitionInstitute) {
          peopleItems.push({ id: 'institute-organizations', label: 'Organizations', icon: Building2, color: 'bg-slate-500', description: 'Manage organizations' });
        }
        peopleItems.push({ id: 'institute-users', label: 'All Users', icon: Users, color: 'bg-blue-500', description: 'View all members' });
        peopleItems.push({ id: 'parents', label: 'Parents', icon: Users, color: 'bg-teal-500', description: 'Parent accounts' });
        peopleItems.push({ id: 'verify-image', label: 'Verify Photos', icon: ImageIcon, color: 'bg-pink-500', description: 'Approve profile photos' });
      }
      if (selectedClass || selectedSubject) {
        peopleItems.push({ id: 'students', label: 'Students', icon: GraduationCap, color: 'bg-indigo-500', description: 'View enrolled students' });
        peopleItems.push({ id: 'unverified-students', label: 'Pending Students', icon: UserCheck, color: 'bg-amber-500', description: 'Awaiting approval' });
      }
      if (peopleItems.length > 0) {
        sections.push({ title: 'People', items: peopleItems });
      }
    }

    // Attendance tools (Admin/Teacher)
    if (selectedInstitute && (userRole === 'InstituteAdmin' || userRole === 'Teacher' || userRole === 'AttendanceMarker')) {
      sections.push({
        title: 'Attendance Tools',
        items: [
          { id: 'daily-attendance', label: 'Mark Attendance', icon: UserCheck, color: 'bg-emerald-500', description: "Take today's attendance" },
          { id: 'qr-attendance', label: 'Scan QR', icon: QrCode, color: 'bg-cyan-500', description: 'Quick QR attendance' },
        ],
      });
    }

    // Classes & Subjects management (Admin)
    if (selectedInstitute && userRole === 'InstituteAdmin' && !selectedClass) {
      sections.push({
        title: 'Manage',
        items: [
          { id: 'classes', label: 'All Classes', icon: School, color: 'bg-violet-500', description: 'Manage all classes' },
          { id: 'institute-subjects', label: `All ${subjectLabel}s`, icon: BookOpen, color: 'bg-indigo-500', description: `View all ${subjectLabel.toLowerCase()}s` },
        ],
      });
    }

    // Messaging (Admin)
    if (selectedInstitute && userRole === 'InstituteAdmin') {
      sections.push({
        title: 'Messaging',
        items: [
          { id: 'sms', label: 'Send SMS', icon: MessageSquare, color: 'bg-sky-500', description: 'Send messages to users' },
          { id: 'sms-history', label: 'SMS History', icon: MessageSquare, color: 'bg-sky-600', description: 'View sent messages' },
        ],
      });
    }

    // Fee management (Admin/Teacher)
    if (selectedInstitute && (userRole === 'InstituteAdmin' || userRole === 'Teacher')) {
      const feeItems: ServiceItem[] = [];
      if (userRole === 'InstituteAdmin') {
        feeItems.push({ id: 'institute-payments', label: 'All Fees', icon: CreditCard, color: 'bg-amber-500', description: 'Manage institute fees' });
        feeItems.push({ id: 'pending-submissions', label: 'Review Payments', icon: Clock, color: 'bg-orange-500', description: 'Approve pending payments' });
      }
      if (selectedSubject) {
        feeItems.push({ id: 'subject-payments', label: 'Subject Fees', icon: CreditCard, color: 'bg-amber-600', description: 'Subject fee details' });
      }
      if (feeItems.length > 0) {
        sections.push({ title: 'Fees Management', items: feeItems });
      }
    }

    // General services
    const serviceItems: ServiceItem[] = [];
    if (userType !== 'USER_WITHOUT_PARENT') {
      serviceItems.push({ id: 'my-children', label: 'My Children', icon: Users, color: 'bg-rose-500', description: 'View your children' });
    }
    serviceItems.push({ id: 'organizations', label: 'Organizations', icon: Building2, color: 'bg-slate-500', description: 'Browse organizations' });
    serviceItems.push({ id: 'transport', label: 'Transport', icon: Bus, color: 'bg-teal-500', description: 'Transport services' });
    serviceItems.push({ id: 'system-payments', label: 'Payments', icon: CreditCard, color: 'bg-amber-500', description: 'Manage payments' });
    sections.push({ title: 'Services', items: serviceItems });

    // Account
    const accountItems: ServiceItem[] = [
      { id: 'profile', label: 'My Profile', icon: User, color: 'bg-blue-500', description: 'View & edit profile' },
    ];
    if (selectedInstitute && ['Student', 'Teacher', 'InstituteAdmin', 'Parent'].includes(userRole)) {
      accountItems.push({ id: 'institute-profile', label: 'ID Card', icon: IdCard, color: 'bg-indigo-500', description: 'Your digital ID card' });
    }
    accountItems.push({ id: 'settings', label: 'Settings', icon: Settings, color: 'bg-gray-500', description: 'App preferences' });
    sections.push({ title: 'Account', items: accountItems });

    return sections;
  };

  const sections = getSections();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg font-bold text-foreground">Services</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-left hover:bg-muted/50 active:bg-muted active:scale-[0.98] transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color} text-white shadow-sm`}>
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ServicesDrawer;
