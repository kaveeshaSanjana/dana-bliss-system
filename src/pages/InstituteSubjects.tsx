import React, { useState } from 'react';
import MUITable from '@/components/ui/mui-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getImageUrl } from '@/utils/imageUrlHelper';
import { RefreshCw, Filter, Eye, Edit, Trash2, Plus, BookOpen, AlertCircle, Power, PowerOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import CreateSubjectForm from '@/components/forms/CreateSubjectForm';
import { useTableData } from '@/hooks/useTableData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { subjectsApi, SUBJECT_TYPE_OPTIONS, BASKET_CATEGORY_OPTIONS, type Subject } from '@/api/subjects.api';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Institute Subjects Management Page
 * 
 * This page allows Institute Admins to:
 * ✅ View all subjects for their institute
 * ✅ Create new subjects
 * ✅ Update existing subjects
 * ✅ Soft delete (deactivate) subjects
 * 
 * Teachers can only:
 * ✅ View subjects (READ ONLY)
 * 
 * Note: Only SUPERADMIN can permanently delete subjects
 */
const InstituteSubjects = () => {
  const {
    user,
    selectedInstitute,
    currentInstituteId
  } = useAuth();
  const { toast } = useToast();
  const userRole = useInstituteRole();
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSubjectData, setSelectedSubjectData] = useState<Subject | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [subjectToDeactivate, setSubjectToDeactivate] = useState<Subject | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subjectTypeFilter, setSubjectTypeFilter] = useState('all');
  const [basketCategoryFilter, setBasketCategoryFilter] = useState('all');

  // Image preview state
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Permission checks
  const isInstituteAdmin = userRole === 'InstituteAdmin';
  const isSuperAdmin = user?.role === 'SystemAdmin';
  const isTeacher = userRole === 'Teacher';
  const canCreate = isInstituteAdmin || isSuperAdmin;
  const canEdit = isInstituteAdmin || isSuperAdmin;
  const canDeactivate = isInstituteAdmin || isSuperAdmin;
  const canPermanentDelete = isSuperAdmin; // Only SUPERADMIN

  // Fetch subjects using useTableData hook
  const tableData = useTableData<Subject>({
    endpoint: '/subjects',
    defaultParams: {
      instituteId: currentInstituteId,
      ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
      ...(searchTerm && { search: searchTerm }),
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
      ...(subjectTypeFilter !== 'all' && { subjectType: subjectTypeFilter }),
      ...(basketCategoryFilter !== 'all' && { basketCategory: basketCategoryFilter }),
    },
    cacheOptions: {
      ttl: 20,
      userId: user?.id,
      role: userRole || 'User',
      instituteId: currentInstituteId || undefined
    },
    dependencies: [currentInstituteId, statusFilter, searchTerm, categoryFilter, subjectTypeFilter, basketCategoryFilter],
    pagination: {
      defaultLimit: 50,
      availableLimits: [25, 50, 100]
    },
    autoLoad: !!currentInstituteId,
  });

  const {
    state: { data: subjectsData, loading: isLoading },
    pagination,
    actions
  } = tableData;

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '/placeholder.svg';
    return getImageUrl(url);
  };

  // Handle deactivate subject
  const handleDeactivateClick = (subject: Subject) => {
    setSubjectToDeactivate(subject);
    setShowDeactivateConfirm(true);
  };

  const confirmDeactivate = async () => {
    if (!subjectToDeactivate || isDeactivating) return;

    try {
      setIsDeactivating(true);
      await subjectsApi.deactivate(subjectToDeactivate.id, currentInstituteId || undefined);
      toast({
        title: "Subject Deactivated",
        description: `${subjectToDeactivate.name} has been deactivated successfully.`
      });
      setShowDeactivateConfirm(false);
      setSubjectToDeactivate(null);
      actions.refresh();
    } catch (error: any) {
      console.error('Error deactivating subject:', error);
      toast({
        title: "Deactivation Failed",
        description: error?.message || "Failed to deactivate subject",
        variant: "destructive"
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  // Handle reactivate subject
  const handleReactivate = async (subject: Subject) => {
    try {
      await subjectsApi.update(subject.id, { isActive: true }, currentInstituteId || undefined);
      toast({
        title: "Subject Activated",
        description: `${subject.name} has been activated successfully.`
      });
      actions.refresh();
    } catch (error: any) {
      console.error('Error reactivating subject:', error);
      toast({
        title: "Activation Failed",
        description: error?.message || "Failed to activate subject",
        variant: "destructive"
      });
    }
  };

  // Handle view subject
  const handleViewSubject = (subject: Subject) => {
    setSelectedSubjectData(subject);
    setIsViewDialogOpen(true);
  };

  // Handle edit subject
  const handleEditSubject = (subject: Subject) => {
    setSelectedSubjectData(subject);
    setIsEditDialogOpen(true);
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    actions.refresh();
  };

  // Handle update success
  const handleUpdateSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedSubjectData(null);
    actions.refresh();
  };

  // Table columns
  const subjectsColumns = [
    {
      id: 'imgUrl',
      key: 'imgUrl',
      header: 'Image',
      format: (value: string | null, row: Subject) => (
        <div 
          className="w-14 h-14 rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => {
            const imgUrl = row?.imgUrl || value;
            if (imgUrl) {
              setPreviewImage({ url: resolveImageUrl(imgUrl), title: `${row?.name || 'Subject'} - Image` });
            }
          }}
        >
          <img
            src={resolveImageUrl(row?.imgUrl || value)}
            alt={row?.name ? `Subject ${row.name}` : 'Subject image'}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </div>
      )
    },
    {
      key: 'code',
      header: 'Code',
      format: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      format: (value: string | null) => value || <span className="text-muted-foreground italic">No name</span>
    },
    {
      key: 'category',
      header: 'Category',
      format: (value: string | null) => value ? (
        <Badge variant="outline">{value}</Badge>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      )
    },
    {
      key: 'creditHours',
      header: 'Credits',
      format: (value: number | null) => value !== null && value !== undefined ? value : <span className="text-muted-foreground italic">—</span>
    },
    {
      key: 'subjectType',
      header: 'Type',
      format: (value: string | null) => {
        if (!value) return <span className="text-muted-foreground italic">N/A</span>;
        const option = SUBJECT_TYPE_OPTIONS.find(o => o.value === value);
        const isBasket = value.includes('BASKET');
        return (
          <Badge variant={isBasket ? 'outline' : 'secondary'} className={isBasket ? 'border-purple-500 text-purple-700 dark:text-purple-300' : ''}>
            {option?.label || value}
          </Badge>
        );
      }
    },
    {
      key: 'basketCategory',
      header: 'Basket',
      format: (value: string | null, row: Subject) => {
        if (!value || !row.subjectType?.includes('BASKET')) {
          return <span className="text-muted-foreground italic">—</span>;
        }
        const option = BASKET_CATEGORY_OPTIONS.find(o => o.value === value);
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-300">
            {option?.label || value}
          </Badge>
        );
      }
    },
    {
      key: 'isActive',
      header: 'Status',
      format: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'} className={value ? 'bg-green-600' : 'bg-gray-500'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      format: (_: any, row: Subject) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewSubject(row)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSubject(row)}
              title="Edit subject"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {canDeactivate && row.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeactivateClick(row)}
              className="text-orange-600 hover:text-orange-700"
              title="Deactivate subject"
            >
              <PowerOff className="h-4 w-4" />
            </Button>
          )}
          
          {canDeactivate && !row.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReactivate(row)}
              className="text-green-600 hover:text-green-700"
              title="Activate subject"
            >
              <Power className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Show message if no institute selected
  if (!currentInstituteId) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              No Institute Selected
            </CardTitle>
            <CardDescription>
              Please select an institute from the dashboard to manage subjects.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Institute Subjects
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedInstitute?.name ? `Manage subjects for ${selectedInstitute.name}` : 'Manage academic subjects'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => actions.refresh()} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {canCreate && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* Role-based info alert */}
      {isTeacher && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            As a Teacher, you have <strong>view-only</strong> access to subjects. Contact your Institute Admin to create or modify subjects.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <Input 
                  placeholder="Search by code, name..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Commerce">Commerce</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Religion">Religion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Subject Type</label>
                <Select value={subjectTypeFilter} onValueChange={setSubjectTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {SUBJECT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Basket Category</label>
                <Select value={basketCategoryFilter} onValueChange={setBasketCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Basket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Baskets</SelectItem>
                    {BASKET_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{subjectsData.length}</div>
            <p className="text-sm text-muted-foreground">Total Subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {subjectsData.filter(s => s.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-500">
              {subjectsData.filter(s => !s.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {subjectsData.filter(s => s.subjectType?.includes('BASKET')).length}
            </div>
            <p className="text-sm text-muted-foreground">Basket Subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <div className="w-full overflow-x-auto">
        <MUITable
          title="Subjects"
          data={subjectsData || []}
          columns={subjectsColumns.map(col => ({
            id: col.key,
            label: col.header,
            minWidth: col.key === 'actions' ? 150 : 120,
            format: col.format
          }))}
          page={pagination.page}
          rowsPerPage={pagination.limit}
          totalCount={pagination.totalCount}
          onPageChange={(newPage: number) => actions.setPage(newPage)}
          onRowsPerPageChange={(newLimit: number) => actions.setLimit(newLimit)}
          sectionType="subjects"
        />
      </div>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to {selectedInstitute?.name || 'this institute'}
            </DialogDescription>
          </DialogHeader>
          <CreateSubjectForm 
            onSubmit={handleCreateSuccess} 
            onCancel={() => setIsCreateDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject information
            </DialogDescription>
          </DialogHeader>
          <CreateSubjectForm 
            initialData={selectedSubjectData}
            onSubmit={handleUpdateSuccess} 
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedSubjectData(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* View Subject Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subject Details</DialogTitle>
          </DialogHeader>
          {selectedSubjectData && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={resolveImageUrl(selectedSubjectData.imgUrl)}
                    alt={selectedSubjectData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedSubjectData.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{selectedSubjectData.code}</p>
                  <Badge variant={selectedSubjectData.isActive ? 'default' : 'secondary'} className="mt-2">
                    {selectedSubjectData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm text-muted-foreground">Category</label>
                  <p className="font-medium">{selectedSubjectData.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Credit Hours</label>
                  <p className="font-medium">{selectedSubjectData.creditHours || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Subject Type</label>
                  <p className="font-medium">
                    {SUBJECT_TYPE_OPTIONS.find(o => o.value === selectedSubjectData.subjectType)?.label || selectedSubjectData.subjectType}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Basket Category</label>
                  <p className="font-medium">
                    {selectedSubjectData.basketCategory 
                      ? BASKET_CATEGORY_OPTIONS.find(o => o.value === selectedSubjectData.basketCategory)?.label || selectedSubjectData.basketCategory
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              
              {selectedSubjectData.description && (
                <div className="pt-4 border-t">
                  <label className="text-sm text-muted-foreground">Description</label>
                  <p className="mt-1">{selectedSubjectData.description}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                {canEdit && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditSubject(selectedSubjectData);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={(open) => !isDeactivating && setShowDeactivateConfirm(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{subjectToDeactivate?.name}</strong>?
              <br /><br />
              This will hide the subject from regular views but will not delete it. You can reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeactivate}
              disabled={isDeactivating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {previewImage && (
              <img 
                src={previewImage.url} 
                alt={previewImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstituteSubjects;
