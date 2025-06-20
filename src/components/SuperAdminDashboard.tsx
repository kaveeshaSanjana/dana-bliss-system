
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, Users, Gift, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import TempleManagement from './superadmin/TempleManagement';
import VillageManagement from './superadmin/VillageManagement';
import FamilyManagement from './superadmin/FamilyManagement';
import HelperManagement from './superadmin/HelperManagement';
import DanaAssignmentManagement from './superadmin/DanaAssignmentManagement';

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview stats
  const stats = [
    { title: 'Temples', count: '12', color: 'bg-blue-500', icon: Building2 },
    { title: 'Villages', count: '45', color: 'bg-green-500', icon: MapPin },
    { title: 'Families', count: '234', color: 'bg-purple-500', icon: Users },
    { title: 'Dana Events', count: '89', color: 'bg-orange-500', icon: Gift }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Super Admin Dashboard 🛕
          </h1>
          <p className="text-blue-600">
            Complete system management and oversight
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="temples">Temples</TabsTrigger>
            <TabsTrigger value="villages">Villages</TabsTrigger>
            <TabsTrigger value="families">Families</TabsTrigger>
            <TabsTrigger value="helpers">Helpers</TabsTrigger>
            <TabsTrigger value="dana">Dana</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="border-blue-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-blue-900 text-2xl">{stat.count}</h3>
                      <p className="text-blue-600 text-sm">{stat.title}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-900">System Management</CardTitle>
                  <CardDescription>Core administrative functions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-blue-900">Dana Coordination</CardTitle>
                  <CardDescription>Advanced offering management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="temples">
            <TempleManagement />
          </TabsContent>

          <TabsContent value="villages">
            <VillageManagement />
          </TabsContent>

          <TabsContent value="families">
            <FamilyManagement />
          </TabsContent>

          <TabsContent value="helpers">
            <HelperManagement />
          </TabsContent>

          <TabsContent value="dana">
            <DanaAssignmentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
