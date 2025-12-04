import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { StatsCards } from '@/components/StatsCards';
import { UserManagement } from '@/components/UserManagement';
import { InstituteManagement } from '@/pages/InstituteManagement';
import SubjectManagement from '@/pages/SubjectManagement';
import SubjectLecturesManagement from '@/pages/SubjectLecturesManagement';
import TransportManagement from '@/pages/TransportManagement';
import { AssignRfidManagement } from '@/pages/AssignRfidManagement';
import { PaymentManagement } from '@/pages/PaymentManagement';
import AdvertisementManagement from '@/pages/AdvertisementManagement';
import { ImageVerification } from '@/pages/ImageVerification';
import SmsPaymentManagement from '@/pages/SmsPaymentManagement';
import SmsCampaignManagement from '@/pages/SmsCampaignManagement';
import OrganizationManagement from '@/pages/OrganizationManagement';
import OrganizationLogin from '@/pages/OrganizationLogin';
import ClassManagement from '@/pages/ClassManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiService from '@/services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isOrgAuthenticated, setIsOrgAuthenticated] = useState(false);

  // Map tabs to routes and vice versa
  const tabToPath: Record<string, string> = {
    dashboard: '/dashboard',
    users: '/user-management',
    institutes: '/institutes',
    subjects: '/subjects',
    lectures: '/subject-lectures',
    transport: '/transport',
    'assign-rfid': '/assign-rfid',
    'image-verification': '/image-verification',
    advertisements: '/advertisements',
    organizations: '/organizations',
    'organization-login': '/organization-login',
    classes: '/classes',
    payments: '/payments',
    'sms-payments': '/sms-payments',
    'sms-campaign': '/sms-campaign',
    settings: '/settings',
  };

  const pathToTab = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard': return 'dashboard';
      case '/user-management': return 'users';
      case '/institutes': return 'institutes';
      case '/subjects': return 'subjects';
      case '/subject-lectures': return 'lectures';
      case '/transport': return 'transport';
      case '/assign-rfid': return 'assign-rfid';
      case '/image-verification': return 'image-verification';
      case '/advertisements': return 'advertisements';
      case '/organizations': return 'organizations';
      case '/organization-login': return 'organization-login';
      case '/classes': return 'classes';
      case '/payments': return 'payments';
      case '/sms-payments': return 'sms-payments';
      case '/sms-campaign': return 'sms-campaign';
      case '/settings': return 'settings';
      default: return 'dashboard';
    }
  };

  useEffect(() => {
    const user = ApiService.getCurrentUser();
    if (!user || !ApiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setAdminUser(user);
    
    // Check organization authentication status
    setIsOrgAuthenticated(ApiService.isOrganizationAuthenticated());

    // If at /admin root, redirect appropriately
    if (location.pathname === '/admin') {
      if (user.userType === 'ORGANIZATION_MANAGER') {
        navigate('/organization-login', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
    
    // If ORGANIZATION_MANAGER visits /dashboard, redirect to organization-login
    if (user.userType === 'ORGANIZATION_MANAGER' && location.pathname === '/dashboard' && !isOrgAuthenticated) {
      navigate('/organization-login', { replace: true });
    }
  }, [navigate, location.pathname]);

  // Sync tab with current route
  useEffect(() => {
    setActiveTab(pathToTab(location.pathname));
  }, [location.pathname]);

  const handleLogout = () => {
    ApiService.logout();
    navigate('/login');
  };

  const handleOrganizationLoginSuccess = () => {
    setIsOrgAuthenticated(true);
    navigate('/organizations');
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  const mockStats = {
    totalUsers: 1250,
    activeUsers: 1180,
    inactiveUsers: 70,
    pendingUsers: 25,
    usersByType: {
      STUDENT: 850,
      TEACHER: 200,
      INSTITUTE_ADMIN: 180,
      ATTENDANCE_MARKER: 15,
      SUPER_ADMIN: 20,
      ORGANIZATION_MANAGER: 0,
      USER: 0,
      USER_WITHOUT_PARENT: 0,
      USER_WITHOUT_STUDENT: 0
    },
    recentRegistrations: 45
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {adminUser.firstName} {adminUser.lastName}. Here's your system overview.
              </p>
            </div>
            <StatsCards stats={mockStats} />
            
            {/* User Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(mockStats.usersByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{type.replace('_', ' ')}</span>
                        <span className="font-medium text-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Active Rate</span>
                      <span className="font-medium text-emerald-600">
                        {((mockStats.activeUsers / mockStats.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">System Load</span>
                      <span className="font-medium text-emerald-600">Normal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">API Status</span>
                      <span className="font-medium text-emerald-600">Operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'users':
        return <UserManagement currentUserType={adminUser.userType} />;
        
      case 'institutes':
        return <InstituteManagement />;
        
      case 'subjects':
        return <SubjectManagement />;
        
      case 'lectures':
        return <SubjectLecturesManagement />;
        
      case 'transport':
        return <TransportManagement />;
        
      case 'assign-rfid':
        return <AssignRfidManagement />;
        
      case 'image-verification':
        return <ImageVerification />;
        
      case 'advertisements':
        return <AdvertisementManagement />;
        
      case 'organizations':
        return <OrganizationManagement />;
        
      case 'organization-login':
        return <OrganizationLogin onLoginSuccess={handleOrganizationLoginSuccess} />;
        
      case 'classes':
        return <ClassManagement />;
        
      case 'payments':
        return <PaymentManagement />;
        
      case 'sms-payments':
        return <SmsPaymentManagement />;
        
      case 'sms-campaign':
        return <SmsCampaignManagement />;
        
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings interface coming soon...</p>
            </CardContent>
          </Card>
        );
        
      default:
        return <OrganizationLogin onLoginSuccess={handleOrganizationLoginSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => navigate(tabToPath[tab] ?? '/dashboard')}
        onLogout={handleLogout}
        adminUser={{
          name: `${adminUser.firstName} ${adminUser.lastName}`,
          email: adminUser.email,
          userType: adminUser.userType
        }}
        isOrgAuthenticated={isOrgAuthenticated}
      />
      
      <main className="md:pl-64">
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
