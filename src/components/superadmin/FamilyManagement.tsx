
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface Family {
  id: number;
  familyName: string;
  address: string;
  telephone: string;
  villageId: number;
  villageName: string;
}

const FamilyManagement: React.FC = () => {
  const [families, setFamilies] = useState<Family[]>([
    {
      id: 1,
      familyName: "Silva Family",
      address: "123 Main Street, Peradeniya",
      telephone: "+94 77 123 4567",
      villageId: 1,
      villageName: "Peradeniya"
    },
    {
      id: 2,
      familyName: "Fernando Family",
      address: "456 Temple Road,adhiya",
      telephone: "+94 77 234 5678",
      villageId: 1,
      villageName: "Peradeniya"
    }
  ]);

  const villages = [
    { id: 1, name: "Peradeniya" },
    { id: 2, name: "Gampola" }
  ];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState({
    familyName: '',
    address: '',
    telephone: '',
    villageId: ''
  });

  const handleAdd = () => {
    const selectedVillage = villages.find(v => v.id === parseInt(formData.villageId));
    const newFamily: Family = {
      id: families.length + 1,
      familyName: formData.familyName,
      address: formData.address,
      telephone: formData.telephone,
      villageId: parseInt(formData.villageId),
      villageName: selectedVillage?.name || ''
    };
    setFamilies([...families, newFamily]);
    setFormData({ familyName: '', address: '', telephone: '', villageId: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (family: Family) => {
    setSelectedFamily(family);
    setFormData({
      familyName: family.familyName,
      address: family.address,
      telephone: family.telephone,
      villageId: family.villageId.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedFamily) {
      const selectedVillage = villages.find(v => v.id === parseInt(formData.villageId));
      setFamilies(families.map(family => 
        family.id === selectedFamily.id 
          ? { 
              ...family, 
              familyName: formData.familyName,
              address: formData.address,
              telephone: formData.telephone,
              villageId: parseInt(formData.villageId),
              villageName: selectedVillage?.name || ''
            }
          : family
      ));
      setIsEditDialogOpen(false);
      setSelectedFamily(null);
      setFormData({ familyName: '', address: '', telephone: '', villageId: '' });
    }
  };

  const handleDelete = (id: number) => {
    setFamilies(families.filter(family => family.id !== id));
  };

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Management
          </CardTitle>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Family
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add New Family</DialogTitle>
              <DialogDescription>
                Create a new family and assign it to a village.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  placeholder="Enter family name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter family address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="Enter telephone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="village">Assign to Village</Label>
                <Select value={formData.villageId} onValueChange={(value) => setFormData({ ...formData, villageId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village.id} value={village.id.toString()}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                Add Family
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
                <TableHead>Family Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Telephone</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((family) => (
                <TableRow key={family.id}>
                  <TableCell className="font-medium">{family.familyName}</TableCell>
                  <TableCell>{family.address}</TableCell>
                  <TableCell>{family.telephone}</TableCell>
                  <TableCell>{family.villageName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(family)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(family.id)}
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
              <DialogTitle className="text-blue-900">Edit Family</DialogTitle>
              <DialogDescription>
                Update family information and village assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-familyName">Family Name</Label>
                <Input
                  id="edit-familyName"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
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
                <Label htmlFor="edit-telephone">Telephone</Label>
                <Input
                  id="edit-telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-village">Assign to Village</Label>
                <Select value={formData.villageId} onValueChange={(value) => setFormData({ ...formData, villageId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village.id} value={village.id.toString()}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                Update Family
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FamilyManagement;
