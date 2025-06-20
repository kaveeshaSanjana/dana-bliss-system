
import React, { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import MemberDashboard from '@/components/MemberDashboard';
import HelperDashboard from '@/components/HelperDashboard';
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
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                  Super Admin Dashboard 🛕
                </h1>
                <p className="text-blue-600">
                  Complete system management and oversight
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: 'Temples', count: '12', color: 'bg-blue-500' },
                  { title: 'Villages', count: '45', color: 'bg-green-500' },
                  { title: 'Families', count: '234', color: 'bg-purple-500' },
                  { title: 'Dana Events', count: '89', color: 'bg-orange-500' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl font-bold mb-3`}>
                      {stat.count}
                    </div>
                    <h3 className="font-semibold text-blue-900">{stat.title}</h3>
                    <p className="text-blue-600 text-sm">Total managed</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-4">System Management</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-blue-100 rounded">
                      <h4 className="font-medium text-blue-800">Temple Administration</h4>
                      <p className="text-sm text-blue-600">Create, edit, and manage all temples</p>
                    </div>
                    <div className="p-3 border border-blue-100 rounded">
                      <h4 className="font-medium text-blue-800">User Management</h4>
                      <p className="text-sm text-blue-600">Manage HeadMonks and Helpers</p>
                    </div>
                    <div className="p-3 border border-blue-100 rounded">
                      <h4 className="font-medium text-blue-800">Village Assignments</h4>
                      <p className="text-sm text-blue-600">Assign villages to temples</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-4">Dana Coordination</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-blue-100 rounded">
                      <h4 className="font-medium text-blue-800">Master Assignment</h4>
                      <p className="text-sm text-blue-600">Temple → Village → Family → Dana</p>
                    </div>
                    <div className="p-3 border border-blue-100 rounded">
                      <h4 className="font-medium text-blue-800">Global Overview</h4>
                      <p className="text-sm text-blue-600">System-wide dana tracking</p>
                    </div>
                    <div className="p-3 border border-blue-100 rounded">
                      <h4 className="font-medium text-blue-800">Analytics</h4>
                      <p className="text-sm text-blue-600">Performance and activity reports</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
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
