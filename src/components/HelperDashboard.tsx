
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Home, Gift, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  familyId?: number;
  familyName?: string;
}

interface Family {
  id: number;
  name: string;
  address: string;
  telephone: string;
  memberCount: number;
}

interface Dana {
  id: number;
  name: string;
  description: string;
  time: string;
  assignedFamilies: number[];
  date: string;
  status: string;
}

const HelperDashboard: React.FC = () => {
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Sunil Perera', phone: '0771234567', email: 'sunil@email.com', familyId: 1, familyName: 'Perera Family' },
    { id: 2, name: 'Kamala Silva', phone: '0777654321', email: 'kamala@email.com', familyId: 2, familyName: 'Silva Family' },
    { id: 3, name: 'Nimal Fernando', phone: '0712345678', email: 'nimal@email.com' },
  ]);

  const [families, setFamilies] = useState<Family[]>([
    { id: 1, name: 'Perera Family', address: 'No. 123, Temple Road, Colombo', telephone: '0112345678', memberCount: 4 },
    { id: 2, name: 'Silva Family', address: 'No. 456, Buddhist Lane, Kandy', telephone: '0812345678', memberCount: 3 },
    { id: 3, name: 'Fernando Family', address: 'No. 789, Dharma Street, Galle', telephone: '0912345678', memberCount: 2 },
  ]);

  const [danas, setDanas] = useState<Dana[]>([
    { id: 1, name: 'Morning Alms', description: 'Daily morning offering', time: 'MORNING', assignedFamilies: [1], date: '2024-06-21', status: 'confirmed' },
    { id: 2, name: 'Evening Dana', description: 'Evening meal offering', time: 'EVENING', assignedFamilies: [2], date: '2024-06-22', status: 'pending' },
    { id: 3, name: 'Poya Day Special', description: 'Full moon day special offering', time: 'MORNING', assignedFamilies: [], date: '2024-06-25', status: 'unassigned' },
  ]);

  const [newMember, setNewMember] = useState({ name: '', phone: '', email: '' });
  const [newFamily, setNewFamily] = useState({ name: '', address: '', telephone: '' });
  const [newDana, setNewDana] = useState({ name: '', description: '', time: 'MORNING' });
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [isAddDanaOpen, setIsAddDanaOpen] = useState(false);

  const handleAddMember = () => {
    if (newMember.name && newMember.phone) {
      const member: Member = {
        id: Date.now(),
        ...newMember
      };
      setMembers([...members, member]);
      setNewMember({ name: '', phone: '', email: '' });
      setIsAddMemberOpen(false);
      toast({
        title: "Member Added Successfully! 🙏",
        description: `${member.name} has been added to the temple community.`,
      });
    }
  };

  const handleAddFamily = () => {
    if (newFamily.name && newFamily.address) {
      const family: Family = {
        id: Date.now(),
        ...newFamily,
        memberCount: 0
      };
      setFamilies([...families, family]);
      setNewFamily({ name: '', address: '', telephone: '' });
      setIsAddFamilyOpen(false);
      toast({
        title: "Family Added Successfully! 🏠",
        description: `${family.name} has been registered.`,
      });
    }
  };

  const handleAddDana = () => {
    if (newDana.name && newDana.description) {
      const dana: Dana = {
        id: Date.now(),
        ...newDana,
        assignedFamilies: [],
        date: new Date().toISOString().split('T')[0],
        status: 'unassigned'
      };
      setDanas([...danas, dana]);
      setNewDana({ name: '', description: '', time: 'MORNING' });
      setIsAddDanaOpen(false);
      toast({
        title: "Dana Created Successfully! 🎋",
        description: `${dana.name} has been added to the offerings.`,
      });
    }
  };

  const handleDeleteMember = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
    toast({
      title: "Member Removed",
      description: "The member has been removed from the system.",
    });
  };

  const handleDeleteFamily = (id: number) => {
    setFamilies(families.filter(f => f.id !== id));
    toast({
      title: "Family Removed",
      description: "The family has been removed from the system.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Helper Dashboard 🤝
          </h1>
          <p className="text-blue-600">
            Manage temple members, families, and dana offerings
          </p>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-blue-200">
            <TabsTrigger value="members" className="data-[state=active]:bg-blue-100">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="families" className="data-[state=active]:bg-blue-100">
              <Home className="w-4 h-4 mr-2" />
              Families
            </TabsTrigger>
            <TabsTrigger value="danas" className="data-[state=active]:bg-blue-100">
              <Gift className="w-4 h-4 mr-2" />
              Dana Management
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-blue-900">Temple Members</CardTitle>
                    <CardDescription>Manage temple community members</CardDescription>
                  </div>
                  <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to the temple community
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="memberName">Name</Label>
                          <Input
                            id="memberName"
                            value={newMember.name}
                            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                            placeholder="Enter member name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="memberPhone">Phone Number</Label>
                          <Input
                            id="memberPhone"
                            value={newMember.phone}
                            onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="memberEmail">Email</Label>
                          <Input
                            id="memberEmail"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                            placeholder="Enter email address"
                          />
                        </div>
                        <Button onClick={handleAddMember} className="w-full">
                          Add Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Family</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {member.familyName ? (
                            <Badge variant="secondary">{member.familyName}</Badge>
                          ) : (
                            <span className="text-gray-500">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Families Tab */}
          <TabsContent value="families">
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-blue-900">Temple Families</CardTitle>
                    <CardDescription>Manage family units and assignments</CardDescription>
                  </div>
                  <Dialog open={isAddFamilyOpen} onOpenChange={setIsAddFamilyOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Family
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Family</DialogTitle>
                        <DialogDescription>
                          Register a new family in the temple community
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="familyName">Family Name</Label>
                          <Input
                            id="familyName"
                            value={newFamily.name}
                            onChange={(e) => setNewFamily({...newFamily, name: e.target.value})}
                            placeholder="Enter family name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="familyAddress">Address</Label>
                          <Input
                            id="familyAddress"
                            value={newFamily.address}
                            onChange={(e) => setNewFamily({...newFamily, address: e.target.value})}
                            placeholder="Enter address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="familyTelephone">Telephone</Label>
                          <Input
                            id="familyTelephone"
                            value={newFamily.telephone}
                            onChange={(e) => setNewFamily({...newFamily, telephone: e.target.value})}
                            placeholder="Enter telephone number"
                          />
                        </div>
                        <Button onClick={handleAddFamily} className="w-full">
                          Add Family
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Family Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Telephone</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {families.map((family) => (
                      <TableRow key={family.id}>
                        <TableCell className="font-medium">{family.name}</TableCell>
                        <TableCell>{family.address}</TableCell>
                        <TableCell>{family.telephone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{family.memberCount} members</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteFamily(family.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dana Management Tab */}
          <TabsContent value="danas">
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-blue-900">Dana Management</CardTitle>
                    <CardDescription>Manage temple offerings and assignments</CardDescription>
                  </div>
                  <Dialog open={isAddDanaOpen} onOpenChange={setIsAddDanaOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Dana
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Dana</DialogTitle>
                        <DialogDescription>
                          Create a new dana offering for the temple
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="danaName">Dana Name</Label>
                          <Input
                            id="danaName"
                            value={newDana.name}
                            onChange={(e) => setNewDana({...newDana, name: e.target.value})}
                            placeholder="Enter dana name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="danaDescription">Description</Label>
                          <Input
                            id="danaDescription"
                            value={newDana.description}
                            onChange={(e) => setNewDana({...newDana, description: e.target.value})}
                            placeholder="Enter description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="danaTime">Time</Label>
                          <Select value={newDana.time} onValueChange={(value) => setNewDana({...newDana, time: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MORNING">Morning</SelectItem>
                              <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                              <SelectItem value="EVENING">Evening</SelectItem>
                              <SelectItem value="NIGHT">Night</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddDana} className="w-full">
                          Create Dana
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dana Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {danas.map((dana) => (
                      <TableRow key={dana.id}>
                        <TableCell className="font-medium">{dana.name}</TableCell>
                        <TableCell>{dana.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{dana.time}</Badge>
                        </TableCell>
                        <TableCell>{dana.date}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              dana.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : dana.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {dana.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelperDashboard;
