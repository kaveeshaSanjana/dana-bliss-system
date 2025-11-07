import { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { buildContextUrl, extractBasePath } from './routeContext';

/**
 * 🔗 Hierarchical Context-Aware Navigation Manager
 * 
 * Automatically syncs URL with context (institute/class/subject)
 * Supports industrial-level hierarchical routing
 */

export const useContextUrlSync = (currentPage: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { 
    selectedInstitute, 
    selectedClass, 
    selectedSubject,
    selectedChild,
    selectedOrganization,
    selectedTransport
  } = useAuth();

  useEffect(() => {
    // Parse current URL context
    const urlContext = parseContextIds(location.pathname);
    const urlBasePath = extractBasePath(location.pathname);
    
    // Build expected context based on selections
    const expectedContext = {
      instituteId: selectedInstitute?.id,
      classId: selectedClass?.id,
      subjectId: selectedSubject?.id,
      childId: selectedChild?.id,
      organizationId: selectedOrganization?.id,
      transportId: selectedTransport?.id
    };
    
    console.log('🔗 URL Sync Check:', {
      currentPath: location.pathname,
      urlContext,
      expectedContext,
      basePath: urlBasePath
    });
    
    // Build expected URL with context
    const expectedUrl = buildSidebarUrl(currentPage, expectedContext);
    
    // Only update if URL doesn't match expected structure
    if (location.pathname !== expectedUrl && !isSpecialRoute(location.pathname)) {
      console.log('🔄 Updating URL:', { from: location.pathname, to: expectedUrl });
      navigate(expectedUrl, { replace: true });
    }
  }, [
    currentPage,
    selectedInstitute?.id,
    selectedClass?.id,
    selectedSubject?.id,
    selectedChild?.id,
    selectedOrganization?.id,
    selectedTransport?.id,
    navigate,
    location.pathname
  ]);
};

/**
 * Check if route is special (shouldn't be modified)
 */
const isSpecialRoute = (pathname: string): boolean => {
  const specialRoutes = [
    '/login',
    '/forgot-password',
    '/change-password',
    '/first-login',
    '/homework/update/',
    '/lecture/update/',
    '/exams/',
    '/payment-submissions/',
    '/homework-submissions/'
  ];
  
  return specialRoutes.some(route => pathname.startsWith(route));
};

/**
 * Extract page name from hierarchical URL
 */
export const extractPageFromUrl = (pathname: string): string => {
  // Handle special routes
  if (pathname === '/' || pathname === '/dashboard') return 'dashboard';
  if (pathname === '/login') return 'login';
  if (pathname === '/forgot-password') return 'forgot-password';
  if (pathname === '/change-password') return 'change-password';
  if (pathname === '/first-login') return 'first-login';
  
  // Remove leading slash
  let path = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  
  // Remove context segments and extract base page
  const parts = path.split('/').filter(Boolean);
  
  // Find the last non-ID part (the actual page)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const prevPart = i > 0 ? parts[i - 1] : null;
    
    // Skip if it's an ID (follows institute/class/subject/child/organization/transport)
    if (prevPart && ['institute', 'class', 'subject', 'child', 'organization', 'transport'].includes(prevPart)) {
      continue;
    }
    
    // This is the page name
    return part;
  }
  
  // Default to dashboard
  return 'dashboard';
};

/**
 * Parse context IDs from URL
 */
export const parseContextIds = (pathname: string): {
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  childId?: string;
  organizationId?: string;
  transportId?: string;
} => {
  const parts = pathname.split('/').filter(Boolean);
  const context: any = {};
  
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const value = parts[i + 1];
    
    if (key === 'institute') context.instituteId = value;
    else if (key === 'class') context.classId = value;
    else if (key === 'subject') context.subjectId = value;
    else if (key === 'child') context.childId = value;
    else if (key === 'organization') context.organizationId = value;
    else if (key === 'transport') context.transportId = value;
  }
  
  return context;
};

/**
 * Build URL for navigation with hierarchical context
 */
export const buildSidebarUrl = (
  page: string,
  context: {
    instituteId?: string;
    classId?: string;
    subjectId?: string;
    childId?: string;
    organizationId?: string;
    transportId?: string;
  }
): string => {
  // Public routes without context
  const publicPages = ['login', 'forgot-password', 'change-password', 'first-login'];
  if (publicPages.includes(page)) {
    return `/${page}`;
  }
  
  // Root-level pages without context
  const rootPages = ['dashboard', 'institutes', 'organizations', 'profile', 'settings', 'my-children'];
  if (rootPages.includes(page) && !context.instituteId && !context.childId) {
    return `/${page}`;
  }
  
  // Child context routes
  if (context.childId) {
    return `/child/${context.childId}/${page}`;
  }
  
  // Organization context routes
  if (context.organizationId) {
    return `/organization/${context.organizationId}/${page}`;
  }
  
  // Transport context routes
  if (context.transportId) {
    return `/transport/${context.transportId}/${page}`;
  }
  
  // Institute hierarchical routes
  if (context.instituteId) {
    let url = `/institute/${context.instituteId}`;
    
    // Class level
    if (context.classId) {
      url += `/class/${context.classId}`;
      
      // Subject level
      if (context.subjectId) {
        url += `/subject/${context.subjectId}`;
      }
    }
    
    // Append page
    url += `/${page}`;
    return url;
  }
  
  // Fallback to simple path
  return `/${page}`;
};

export default {
  useContextUrlSync,
  extractPageFromUrl,
  parseContextIds,
  buildSidebarUrl
};
