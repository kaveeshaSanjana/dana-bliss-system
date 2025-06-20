
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

interface Village {
  id: number;
  name: string;
  province: string;
  district: string;
  country: string;
  postalCode: string;
  templeId: number;
  templeName: string;
}

const VillageManagement: React.FC = () => {
  const [villages, setVillages] = useState<Village[]>([
    {
      id: 1,
      name: "Peradeniya",
      province: "Central",
      district: "Kandy",
      country: "Sri Lanka",
      postalCode: "20400",
      templeId: 1,
      templeName: "Dharma Temple"
    },
    {
      id: 2,
      name: "Gampola",
      province: "Central",
      district: "Kandy",
      country: "Sri Lanka",
      postalCode: "20500",
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
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    country: 'Sri Lanka',
    postalCode: '',
    templeId: ''
  });

  const handleAdd = () => {
    const selectedTemple = temples.find(t => t.id === parseInt(formData.templeId));
    const newVillage: Village = {
      id: villages.length + 1,
      name: formData.name,
      province: formData.province,
      district: formData.district,
      country: formData.country,
      postalCode: formData.postalCode,
      templeId: parseInt(formData.templeId),
      templeName: selectedTemple?.name || ''
    };
    setVillages([...villages, newVillage]);
    setFormData({ name: '', province: '', district: '', country: 'Sri Lanka', postalCode: '', templeId: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (village: Village) => {
    setSelectedVillage(village);
    setFormData({
      name: village.name,
      province: village.province,
      district: village.district,
      country: village.country,
      postalCode: village.postalCode,
      templeId: village.templeId.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedVillage) {
      const selectedTemple = temples.find(t => t.id === parseInt(formData.templeId));
      setVillages(villages.map(village => 
        village.id === selectedVillage.id 
          ? { 
              ...village, 
              name: formData.name,
              province: formData.province,
              district: formData.district,
              country: formData.country,
              postalCode: formData.postalCode,
              templeId: parseInt(formData.templeId),
              templeName: selectedTemple?.name || ''
            }
          : village
      ));
      setIsEditDialogOpen(false);
      setSelectedVillage(null);
      setFormData({ name: '', province: '', district: '', country: 'Sri Lanka', postalCode: '', templeId: '' });
    }
  };

  const handleDelete = (id: number) => {
    setVillages(villages.filter(village => village.id !== id));
  };

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Village Management
          </CardTitle>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Village
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add New Village</DialogTitle>
              <DialogDescription>
                Create a new village and assign it to a temple.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Village Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter village name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="Enter province"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Enter district"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Enter postal code"
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
                Add Village
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
                <TableHead>Village Name</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Postal Code</TableHead>
                <TableHead>Temple</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {villages.map((village) => (
                <TableRow key={village.id}>
                  <TableCell className="font-medium">{village.name}</TableCell>
                  <TableCell>{village.province}</TableCell>
                  <TableCell>{village.district}</TableCell>
                  <TableCell>{village.postalCode}</TableCell>
                  <TableCell>{village.templeName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(village)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(village.id)}
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
              <DialogTitle className="text-blue-900">Edit Village</DialogTitle>
              <DialogDescription>
                Update village information and temple assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Village Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-province">Province</Label>
                <Input
                  id="edit-province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-district">District</Label>
                <Input
                  id="edit-district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-postalCode">Postal Code</Label>
                <Input
                  id="edit-postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
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
                Update Village
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VillageManagement;
