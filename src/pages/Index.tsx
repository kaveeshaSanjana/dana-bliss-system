
import React, { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import MemberDashboard from '@/components/MemberDashboard';
import HelperDashboard from '@/components/HelperDashboard';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface User {
  phoneNumber: string;
  role: string;
  name: string;
}

const Index: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (phoneNumber: string, password: string, role: string) => {
    // Mock authentication - in real app, this would call an API
    const mockUser: User = {
      phoneNumber,
      role,
      name: role === 'Member' ? 'Devotee' : role === 'Helper' ? 'Temple Helper' : role === 'HeadMonk' ? 'Venerable Monk' : 'Administrator'
    };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Member':
        return <MemberDashboard />;
      case 'Helper':
        return <HelperDashboard />;
      case 'HeadMonk':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-lg p-8 shadow-lg border border-blue-200">
                <h1 className="text-3xl font-bold text-blue-900 mb-4">
                  Head Monk Dashboard 🧘‍♂️
                </h1>
                <p className="text-blue-600 mb-6">
                  Advanced temple management features coming soon...
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Village Management</h3>
                    <p className="text-sm text-blue-600">Manage temple villages and assignments</p>
                  </div>
                  <div className="p-4 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Helper Oversight</h3>
                    <p className="text-sm text-blue-600">Supervise temple helpers and duties</p>
                  </div>
                  <div className="p-4 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Advanced Dana</h3>
                    <p className="text-sm text-blue-600">Comprehensive offering management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'SuperAdmin':
        return <SuperAdminDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="relative">
      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Welcome Header */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Welcome back,</p>
          <p className="font-semibold text-blue-900">{user.name}</p>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default Index;
