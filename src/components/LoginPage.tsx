
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoginPageProps {
  onLogin: (phoneNumber: string, password: string, role: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber && password && role) {
      onLogin(phoneNumber, password, role);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Dana Management</h1>
          <p className="text-blue-600">Temple Donation System</p>
        </div>

        <Card className="peaceful-card border-blue-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-900">Welcome Back</CardTitle>
            <CardDescription className="text-blue-600">
              Sign in to manage temple donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-blue-800">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-800">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-blue-800">Select Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Helper">Helper</SelectItem>
                    <SelectItem value="HeadMonk">Head Monk</SelectItem>
                    <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!phoneNumber || !password || !role}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-blue-600 text-sm mt-6">
          May peace and compassion guide your service 🙏
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
