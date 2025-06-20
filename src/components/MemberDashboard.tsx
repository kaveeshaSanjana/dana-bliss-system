
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Calendar, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DanaRecord {
  id: number;
  date: string;
  type: string;
  status: 'confirmed' | 'pending' | 'completed';
  description?: string;
}

const MemberDashboard: React.FC = () => {
  const { toast } = useToast();
  const [danaRecords, setDanaRecords] = useState<DanaRecord[]>([
    {
      id: 1,
      date: '2024-06-19',
      type: 'Morning Alms',
      status: 'completed',
      description: 'Rice and curry offering'
    },
    {
      id: 2,
      date: '2024-06-21',
      type: 'Evening Dana',
      status: 'pending',
      description: 'Vegetable curry and fruits'
    },
    {
      id: 3,
      date: '2024-06-25',
      type: 'Special Poya Dana',
      status: 'pending',
      description: 'Full meal offering for 10 monks'
    }
  ]);

  const handleConfirm = (id: number) => {
    setDanaRecords(prev => 
      prev.map(record => 
        record.id === id 
          ? { ...record, status: 'confirmed' as const }
          : record
      )
    );
    
    toast({
      title: "Dana Confirmed! 🙏",
      description: "Your offering has been confirmed. May your generosity bring merit.",
      duration: 3000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const tomorrowsDana = danaRecords.find(record => record.date === '2024-06-21');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Your Dana Journey 🙏
          </h1>
          <p className="text-blue-600">
            Track your temple offerings and spiritual contributions
          </p>
        </div>

        {/* Tomorrow's Dana Alert */}
        {tomorrowsDana && tomorrowsDana.status === 'pending' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 peaceful-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Calendar className="w-5 h-5" />
                Tomorrow's Dana Reminder
              </CardTitle>
              <CardDescription className="text-yellow-700">
                You have a dana offering scheduled for tomorrow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-yellow-800">{tomorrowsDana.type}</p>
                  <p className="text-sm text-yellow-700">{tomorrowsDana.description}</p>
                  <p className="text-sm text-yellow-600">Date: {tomorrowsDana.date}</p>
                </div>
                <Button
                  onClick={() => handleConfirm(tomorrowsDana.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dana Records */}
        <div className="grid gap-6">
          <h2 className="text-2xl font-semibold text-blue-900 flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Your Dana Records
          </h2>

          {danaRecords.map((record) => (
            <Card key={record.id} className="peaceful-card border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">{record.type}</h3>
                      <p className="text-sm text-blue-600">Date: {record.date}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
                
                {record.description && (
                  <p className="text-blue-700 bg-blue-50 p-3 rounded-lg">
                    {record.description}
                  </p>
                )}

                {record.status === 'pending' && record.id !== tomorrowsDana?.id && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <Button
                      onClick={() => handleConfirm(record.id)}
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Dana
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Spiritual Quote */}
        <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <p className="italic text-blue-800 text-lg mb-2">
              "Generosity brings happiness at every stage of its expression."
            </p>
            <p className="text-blue-600 text-sm">— Buddhist Teaching</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
