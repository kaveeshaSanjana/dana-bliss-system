
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface Helper {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  templeId: number;
  templeName: string;
}

const HelperManagement: React.FC = () => {
  const [helpers, setHelpers] = useState<Helper[]>([
    {
      id: 1,
      name: "John Perera",
      email: "john.perera@example.com",
      phoneNumber: "+94 77 123 4567",
      templeId: 1,
      templeName: "Dharma Temple"
    },
    {
      id: 2,
      name: "Mary Silva",
      email: "mary.silva@example.com",
      phoneNumber: "+94 77 234 5678",
      templeId: 2,
      templeName: "Bodhi Temple"
    }
  ]);

  const temples = [
    { id: 1, name: "Dharma Temple" },
    { id: 2, name: "Bodhi Temple" }
  ];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    templeId: ''
  });

  const handleAdd = () => {
    const selectedTemple = temples.find(t => t.id === parseInt(formData.templeId));
    const newHelper: Helper = {
      id: helpers.length + 1,
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      templeId: parseInt(formData.templeId),
      templeName: selectedTemple?.name || ''
    };
    setHelpers([...helpers, newHelper]);
    setFormData({ name: '', email: '', phoneNumber: '', templeId: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (helper: Helper) => {
    setSelectedHelper(helper);
    setFormData({
      name: helper.name,
      email: helper.email,
      phoneNumber: helper.phoneNumber,
      templeId: helper.templeId.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedHelper) {
      const selectedTemple = temples.find(t => t.id === parseInt(formData.templeId));
      setHelpers(helpers.map(helper => 
        helper.id === selectedHelper.id 
          ? { 
              ...helper, 
              name: formData.name,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              templeId: parseInt(formData.templeId),
              templeName: selectedTemple?.name || ''
            }
          : helper
      ));
      setIsEditDialogOpen(false);
      setSelectedHelper(null);
      setFormData({ name: '', email: '', phoneNumber: '', templeId: '' });
    }
  };

  const handleDelete = (id: number) => {
    setHelpers(helpers.filter(helper => helper.id !== id));
  };

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Helper Management
          </CardTitle>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Helper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add New Helper</DialogTitle>
              <DialogDescription>
                Create a new helper and assign them to a temple.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Helper Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter helper name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="temple">Assign to Temple</Label>
                <Select value={formData.templeId} onValueChange={(value) => setFormData({ ...formData, templeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select temple" />
                  </SelectTrigger>
                  <SelectContent>
                    {temples.map((temple) => (
                      <SelectItem key={temple.id} value={temple.id.toString()}>
                        {temple.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                Add Helper
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Temple</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {helpers.map((helper) => (
                <TableRow key={helper.id}>
                  <TableCell className="font-medium">{helper.name}</TableCell>
                  <TableCell>{helper.email}</TableCell>
                  <TableCell>{helper.phoneNumber}</TableCell>
                  <TableCell>{helper.templeName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(helper)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(helper.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Edit Helper</DialogTitle>
              <DialogDescription>
                Update helper information and temple assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Helper Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                <Input
                  id="edit-phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-temple">Assign to Temple</Label>
                <Select value={formData.templeId} onValueChange={(value) => setFormData({ ...formData, templeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select temple" />
                  </SelectTrigger>
                  <SelectContent>
                    {temples.map((temple) => (
                      <SelectItem key={temple.id} value={temple.id.toString()}>
                        {temple.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                Update Helper
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HelperManagement;
