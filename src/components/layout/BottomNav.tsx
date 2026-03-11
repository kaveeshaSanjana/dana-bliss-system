import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Bell, User, LayoutGrid, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { buildSidebarUrl } from '@/utils/pageNavigation';
import { useNotificationStore } from '@/stores/useNotificationStore';
import ServicesDrawer from './ServicesDrawer';

interface BottomNavProps {
  onMenuClick: () => void;
}

const BottomNav = ({ onMenuClick }: BottomNavProps) => {
  const { selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, selectedTransport } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [servicesOpen, setServicesOpen] = useState(false);
  const { globalUnreadCount: unreadCount } = useNotificationStore();

  const isActive = useCallback((path: string) => {
    if (path === '/dashboard' || path === '/select-institute') {
      return location.pathname === '/dashboard' || location.pathname === '/select-institute' || location.pathname === '/';
    }
    return location.pathname.includes(path);
  }, [location.pathname]);

  const handleHomeClick = useCallback(() => {
    if (selectedInstitute?.id) {
      navigate(`/institute/${selectedInstitute.id}/dashboard`);
    } else {
      navigate('/dashboard');
    }
  }, [selectedInstitute?.id, navigate]);

  const handleProfileClick = useCallback(() => {
    const context = {
      instituteId: selectedInstitute?.id,
      classId: selectedClass?.id,
      subjectId: selectedSubject?.id,
      childId: selectedChild?.id,
      organizationId: selectedOrganization?.id,
      transportId: selectedTransport?.id,
    };
    navigate(buildSidebarUrl('profile', context));
  }, [selectedInstitute?.id, selectedClass?.id, selectedSubject?.id, selectedChild?.id, selectedOrganization?.id, selectedTransport?.id, navigate]);

  const handleNotificationsClick = useCallback(() => {
    navigate('/all-notifications');
  }, [navigate]);

  const isHomePath = isActive('/dashboard') || (selectedInstitute && isActive(`/institute/${selectedInstitute.id}/dashboard`));
  const isNotifPath = location.pathname === '/all-notifications' || location.pathname.endsWith('/notifications');
  const isProfilePath = location.pathname === '/profile' || location.pathname.endsWith('/profile');

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 pb-safe-bottom">
        <div className="flex items-center justify-around h-16 relative">
          {/* Home */}
          <button
            onClick={handleHomeClick}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
              isHomePath ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>

          {/* Center Services Button - Elevated */}
          <div className="flex flex-col items-center justify-center flex-1 h-full">
            <button
              onClick={() => setServicesOpen(true)}
              className="relative -mt-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
            >
              <LayoutGrid className="h-6 w-6" />
            </button>
            <span className="text-[10px] font-medium text-muted-foreground -mt-0.5">Services</span>
          </div>

          {/* Menu (Sidebar) */}
          <button
            onClick={onMenuClick}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground transition-colors"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      <ServicesDrawer open={servicesOpen} onOpenChange={setServicesOpen} />
    </>
  );
};

export default BottomNav;
