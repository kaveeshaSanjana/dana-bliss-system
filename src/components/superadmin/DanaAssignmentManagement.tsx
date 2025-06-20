
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Gift, Calendar } from 'lucide-react';

interface DanaAssignment {
  id: number;
  templeName: string;
  villageName: string;
  familyName: string;
  danaName: string;
  date: string;
  isConfirmed: boolean;
  time: string;
}

const DanaAssignmentManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<DanaAssignment[]>([
    {
      id: 1,
      templeName: "Dharma Temple",
      villageName: "Peradeniya",
      familyName: "Silva Family",
      danaName: "Morning Dana",
      date: "2024-01-15",
      isConfirmed: true,
      time: "MORNING"
    },
    {
      id: 2,
      templeName: "Bodhi Temple",
      villageName: "Gampola",
      familyName: "Fernando Family",
      danaName: "Evening Dana",
      date: "2024-01-16",
      isConfirmed: false,
      time: "EVENING"
    }
  ]);

  const temples = [
    { id: 1, name: "Dharma Temple" },
    { id: 2, name: "Bodhi Temple" }
  ];

  const villages = [
    { id: 1, name: "Peradeniya", templeId: 1 },
    { id: 2, name: "Gampola", templeId: 2 }
  ];

  const families = [
    { id: 1, name: "Silva Family", villageId: 1 },
    { id: 2, name: "Fernando Family", villageId: 2 }
  ];

  const danas = [
    { id: 1, name: "Morning Dana", time: "MORNING" },
    { id: 2, name: "Afternoon Dana", time: "AFTERNOON" },
    { id: 3, name: "Evening Dana", time: "EVENING" }
  ];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    templeId: '',
    villageId: '',
    familyId: '',
    danaId: '',
    date: ''
  });

  const [filteredVillages, setFilteredVillages] = useState(villages);
  const [filteredFamilies, setFilteredFamilies] = useState(families);

  const handleTempleChange = (templeId: string) => {
    setFormData({ ...formData, templeId, villageId: '', familyId: '' });
    setFilteredVillages(villages.filter(v => v.templeId === parseInt(templeId)));
    setFilteredFamilies([]);
  };

  const handleVillageChange = (villageId: string) => {
    setFormData({ ...formData, villageId, familyId: '' });
    setFilteredFamilies(families.filter(f => f.villageId === parseInt(villageId)));
  };

  const handleAdd = () => {
    const selectedTemple = temples.find(t => t.id === parseInt(formData.templeId));
    const selectedVillage = villages.find(v => v.id === parseInt(formData.villageId));
    const selectedFamily = families.find(f => f.id === parseInt(formData.familyId));
    const selectedDana = danas.find(d => d.id === parseInt(formData.danaId));

    const newAssignment: DanaAssignment = {
      id: assignments.length + 1,
      templeName: selectedTemple?.name || '',
      villageName: selectedVillage?.name || '',
      familyName: selectedFamily?.name || '',
      danaName: selectedDana?.name || '',
      date: formData.date,
      isConfirmed: false,
      time: selectedDana?.time || ''
    };

    setAssignments([...assignments, newAssignment]);
    setFormData({ templeId: '', villageId: '', familyId: '', danaId: '', date: '' });
    setIsAddDialogOpen(false);
  };

  const handleConfirm = (id: number) => {
    setAssignments(assignments.map(assignment => 
      assignment.id === id 
        ? { ...assignment, isConfirmed: true }
        : assignment
    ));
  };

  const handleDelete = (id: number) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Dana Assignment Management
          </CardTitle>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Create Dana Assignment</DialogTitle>
              <DialogDescription>
                Assign dana to a family following Temple → Village → Family → Dana flow.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="temple">Select Temple</Label>
                <Select value={formData.templeId} onValueChange={handleTempleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose temple" />
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

              <div className="grid gap-2">
                <Label htmlFor="village">Select Village</Label>
                <Select 
                  value={formData.villageId} 
                  onValueChange={handleVillageChange}
                  disabled={!formData.templeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose village" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVillages.map((village) => (
                      <SelectItem key={village.id} value={village.id.toString()}>
                        {village.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="family">Select Family</Label>
                <Select 
                  value={formData.familyId} 
                  onValueChange={(value) => setFormData({ ...formData, familyId: value })}
                  disabled={!formData.villageId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose family" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFamilies.map((family) => (
                      <SelectItem key={family.id} value={family.id.toString()}>
                        {family.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dana">Select Dana</Label>
                <Select value={formData.danaId} onValueChange={(value) => setFormData({ ...formData, danaId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose dana" />
                  </SelectTrigger>
                  <SelectContent>
                    {danas.map((dana) => (
                      <SelectItem key={dana.id} value={dana.id.toString()}>
                        {dana.name} ({dana.time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Dana Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                Create Assignment
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
                <TableHead>Temple</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Dana</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.templeName}</TableCell>
                  <TableCell>{assignment.villageName}</TableCell>
                  <TableCell>{assignment.familyName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{assignment.danaName}</span>
                      <span className="text-sm text-blue-600">{assignment.time.toLowerCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {new Date(assignment.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={assignment.isConfirmed ? "default" : "secondary"}>
                      {assignment.isConfirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!assignment.isConfirmed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirm(assignment.id)}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          Confirm
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
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
      </CardContent>
    </Card>
  );
};

export default DanaAssignmentManagement;
