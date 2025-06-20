
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

interface Temple {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  website: string;
}

const TempleManagement: React.FC = () => {
  const [temples, setTemples] = useState<Temple[]>([
    {
      id: 1,
      name: "Dharma Temple",
      address: "123 Temple Street, Colombo",
      contactNumber: "+94 11 234 5678",
      email: "info@dharmatemple.lk",
      website: "www.dharmatemple.lk"
    },
    {
      id: 2,
      name: "Bodhi Temple",
      address: "456 Peace Avenue, Kandy",
      contactNumber: "+94 81 234 5678",
      email: "contact@bodhitemple.lk",
      website: "www.bodhitemple.lk"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    email: '',
    website: ''
  });

  const handleAdd = () => {
    const newTemple: Temple = {
      id: temples.length + 1,
      ...formData
    };
    setTemples([...temples, newTemple]);
    setFormData({ name: '', address: '', contactNumber: '', email: '', website: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (temple: Temple) => {
    setSelectedTemple(temple);
    setFormData({
      name: temple.name,
      address: temple.address,
      contactNumber: temple.contactNumber,
      email: temple.email,
      website: temple.website
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedTemple) {
      setTemples(temples.map(temple => 
        temple.id === selectedTemple.id 
          ? { ...temple, ...formData }
          : temple
      ));
      setIsEditDialogOpen(false);
      setSelectedTemple(null);
      setFormData({ name: '', address: '', contactNumber: '', email: '', website: '' });
    }
  };

  const handleDelete = (id: number) => {
    setTemples(temples.filter(temple => temple.id !== id));
  };

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Temple Management
          </CardTitle>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Temple
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add New Temple</DialogTitle>
              <DialogDescription>
                Create a new temple in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Temple Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter temple name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter temple address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="Enter contact number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="Enter website URL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                Add Temple
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
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temples.map((temple) => (
                <TableRow key={temple.id}>
                  <TableCell className="font-medium">{temple.name}</TableCell>
                  <TableCell>{temple.address}</TableCell>
                  <TableCell>{temple.contactNumber}</TableCell>
                  <TableCell>{temple.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(temple)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(temple.id)}
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
              <DialogTitle className="text-blue-900">Edit Temple</DialogTitle>
              <DialogDescription>
                Update temple information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Temple Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contactNumber">Contact Number</Label>
                <Input
                  id="edit-contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                Update Temple
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TempleManagement;
