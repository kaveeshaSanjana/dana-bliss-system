
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { buildContextUrl } from '@/utils/routeContext';

export const useAppNavigation = () => {
  const { 
    currentChildId, 
    selectedChild, 
    selectedInstitute, 
    selectedClass, 
    selectedSubject 
  } = useAuth();

  // Router-agnostic navigation with hierarchical context-aware URLs
  const navigateToPage = useCallback((page: string) => {
    console.log('🔗 Navigating to page:', page);
    
    // Base route mapping (without context)
    const baseRouteMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'institutes': '/institutes',
      'profile': '/profile',
      'users': '/users',
      'organizations': '/organizations',
      'my-children': '/my-children',
      'transport': '/transport',
      'settings': '/settings',
      'appearance': '/appearance',
      // Auth routes
      'login': '/login',
      'forgot-password': '/forgot-password',
      'change-password': '/change-password',
      'first-login': '/first-login'
    };
    
    // Context-dependent routes
    const contextRouteMap: Record<string, string> = {
      'students': '/students',
      'teachers': '/teachers',
      'parents': '/parents',
      'classes': '/classes',
      'subjects': '/subjects',
      'attendance': '/attendance',
      'payments': '/payments',
      'lectures': '/lectures',
      'homework': '/homework',
      'exams': '/exams',
      'results': '/results',
      'institute-users': '/users',
      'institute-classes': '/classes',
      'institute-organizations': '/organizations',
      'institute-payments': '/payments',
      'institute-lectures': '/lectures',
      'subject-payments': '/payments',
      'gallery': '/gallery',
      'sms': '/sms',
      'institute-profile': '/profile'
    };
    
    // Child-specific routes
    if (page.startsWith('child-') || page === 'my-children') {
      const childRoutes: Record<string, string> = {
        'child-dashboard': '/dashboard',
        'child-results': '/results',
        'child-attendance': '/attendance',
        'child-transport': '/transport'
      };
      
      const childRoute = childRoutes[page];
      if (childRoute) {
        const cid = (currentChildId ?? selectedChild?.id) as string | undefined;
        const route = cid ? `/child/${cid}${childRoute}` : '/my-children';
        
        try {
          window.history.pushState({}, '', route);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (e) {
          window.location.assign(route);
        }
        return;
      }
    }
    
    // Check if route is context-independent
    if (baseRouteMap[page]) {
      const route = baseRouteMap[page];
      try {
        window.history.pushState({}, '', route);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (e) {
        window.location.assign(route);
      }
      return;
    }
    
    // Build context-aware hierarchical URL
    const basePath = contextRouteMap[page] || `/${page}`;
    const context = {
      instituteId: selectedInstitute?.id,
      classId: selectedClass?.id,
      subjectId: selectedSubject?.id
    };
    
    const route = buildContextUrl(basePath, context);
    
    console.log('🚀 Hierarchical route:', { page, basePath, context, route });
    
    try {
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {
      window.location.assign(route);
    }
  }, [currentChildId, selectedChild?.id, selectedInstitute?.id, selectedClass?.id, selectedSubject?.id]);

  const getPageFromPath = useCallback((pathname: string): string => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/institutes/users') return 'institute-users';
    if (pathname === '/institutes/classes') return 'institute-classes';
    if (pathname === '/subject-pay-submission') return 'subject-pay-submission';
    return pathname.replace(/^\//, '');
  }, []);

  return {
    navigateToPage,
    getPageFromPath
  };
};
