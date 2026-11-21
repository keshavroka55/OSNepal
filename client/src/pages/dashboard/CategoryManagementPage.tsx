// pages/CategoryManagementPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, Search, X, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import {
  getAllCategoriesAPI,
  createCategoryAPI,
  deleteCategoryAPI,
  updateCategoryAPI,
} from '../../features/categories/StartupcategoryService';

type Category = {
  id: string;
  name: string;
  description?: string;
  startups?: any[];
  createdAt?: string;
  updatedAt?: string;
};

export default function CategoryManagementPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories from API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const data = await getAllCategoriesAPI();
        setCategories(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError('Failed to load categories. Please try again.');
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-screen bg-card">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md px-5"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-foreground text-[28px] font-semibold leading-[32px] mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground text-[17px] leading-[25px]">
              You don't have permission to access this page. Please contact an administrator.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Create category via API
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsAdding(true);
    try {
      const newCategory = await createCategoryAPI({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setIsAddDialogOpen(false);
      toast.success('Category added successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setIsAdding(false);
    }
  };

  // Open edit dialog
  const handleEditOpen = (category: Category) => {
    setEditCategory(category);
    setEditName(category.name);
    setEditDesc(category.description || '');
    setIsEditDialogOpen(true);
  };

  // Update category via API
  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!editCategory) return;

    setIsUpdating(true);
    try {
      const updated = await updateCategoryAPI(editCategory.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
      setIsEditDialogOpen(false);
      toast.success('Category updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open delete confirmation
  const handleDeleteOpen = (category: Category) => {
    setDeleteCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Delete category via API
  const handleDelete = async () => {
    if (!deleteCategory) return;

    setIsDeleting(true);
    try {
      await deleteCategoryAPI(deleteCategory.id);
      setCategories(categories.filter((c) => c.id !== deleteCategory.id));
      setIsDeleteDialogOpen(false);
      setDeleteCategory(null);
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  });

  const totalStartups = categories.reduce(
    (sum, cat) => sum + (cat.startups?.length || 0),
    0
  );

  return (
    <div className="flex h-screen overflow-hidden bg-card">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1262px] mx-auto px-5 md:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <span className="text-muted-foreground text-[12px] font-normal leading-[16px]">
                  ADMIN PANEL
                </span>
                <h1 className="text-foreground text-[40px] md:text-[48px] font-semibold leading-[44px] md:leading-[52px] mt-2 mb-2">
                  Categories
                </h1>
                <p className="text-foreground text-[17px] font-normal leading-[25px]">
                  Manage startup categories and organize products
                </p>
              </div>

              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="h-[44px] rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active text-[17px] leading-[25px] px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border border-border bg-card p-5">
                <span className="text-[12px] text-muted-foreground leading-[16px]">
                  Total Categories
                </span>
                <div className="text-[28px] font-semibold leading-[32px] text-foreground mt-2">
                  {categories.length}
                </div>
              </div>
              <div className="border border-border bg-card p-5">
                <span className="text-[12px] text-muted-foreground leading-[16px]">
                  Total Startups
                </span>
                <div className="text-[28px] font-semibold leading-[32px] text-foreground mt-2">
                  {totalStartups}
                </div>
              </div>
              <div className="border border-border bg-card p-5">
                <span className="text-[12px] text-muted-foreground leading-[16px]">
                  Avg per Category
                </span>
                <div className="text-[28px] font-semibold leading-[32px] text-foreground mt-2">
                  {categories.length > 0
                    ? Math.round(totalStartups / categories.length)
                    : 0}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[44px] rounded-lg pl-12 border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-danger/10 border border-danger/30 flex items-center justify-between"
            >
              <p className="text-[17px] leading-[25px] text-danger">{error}</p>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-danger/10 rounded-full"
              >
                <X className="h-4 w-4 text-danger" />
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!loading && categories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 border border-border"
            >
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-foreground text-[28px] font-semibold leading-[32px] mb-2">
                No categories yet
              </h2>
              <p className="text-muted-foreground text-[17px] leading-[25px] mb-6 max-w-md mx-auto">
                Create your first category to start organizing startups on the platform.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="h-[44px] rounded-full bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Category
              </Button>
            </motion.div>
          )}

          {/* No Search Results */}
          {!loading && categories.length > 0 && filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 border border-border"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-foreground text-[24px] font-semibold leading-[28px] mb-2">
                No results found
              </h2>
              <p className="text-muted-foreground text-[17px] leading-[25px] mb-6">
                No categories match your search. Try different keywords.
              </p>
              <Button
                onClick={() => setSearchQuery('')}
                className="h-[44px] rounded-full border-2 border-primary text-primary hover:bg-[rgba(0,113,227,0.05)]"
              >
                Clear Search
              </Button>
            </motion.div>
          )}

          {/* Categories Table */}
          {!loading && filteredCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border border-border overflow-hidden"
            >
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-4 text-left text-[12px] font-semibold text-muted-foreground leading-[16px] w-[30%]">
                        Name
                      </th>
                      <th className="p-4 text-left text-[12px] font-semibold text-muted-foreground leading-[16px] w-[35%]">
                        Description
                      </th>
                      <th className="p-4 text-left text-[12px] font-semibold text-muted-foreground leading-[16px] w-[15%]">
                        Startups
                      </th>
                      <th className="p-4 text-right text-[12px] font-semibold text-muted-foreground leading-[16px] w-[20%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-accent transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="text-[17px] font-semibold leading-[21px] text-foreground">
                              {category.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-[17px] leading-[25px] text-muted-foreground line-clamp-2">
                            {category.description || '—'}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="rounded-full text-[12px] leading-[16px]">
                            {category.startups?.length || 0} startup{(category.startups?.length || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOpen(category)}
                              className="h-[32px] rounded-full text-muted-foreground hover:text-primary hover:bg-transparent"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOpen(category)}
                              className="h-[32px] rounded-full text-muted-foreground hover:text-danger hover:bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="md:hidden divide-y divide-border">
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-accent"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold leading-[21px] text-foreground mb-1">
                          {category.name}
                        </p>
                        <p className="text-[12px] leading-[16px] text-muted-foreground line-clamp-2">
                          {category.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="rounded-full text-[12px] leading-[16px] ml-2 flex-shrink-0">
                        {category.startups?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOpen(category)}
                        className="flex-1 h-[32px] rounded-full text-muted-foreground hover:text-primary hover:bg-transparent text-[12px]"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOpen(category)}
                        className="flex-1 h-[32px] rounded-full text-muted-foreground hover:text-danger hover:bg-transparent text-[12px]"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-[20px] font-semibold leading-[24px] text-foreground">
              Add New Category
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-[16px] text-muted-foreground mt-1">
              Create a new category to organize startups
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <Label className="text-[12px] font-semibold leading-[16px] text-foreground mb-2 block">
                Category Name *
              </Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Artificial Intelligence"
                className="h-[44px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]"
              />
            </div>
            <div>
              <Label className="text-[12px] font-semibold leading-[16px] text-foreground mb-2 block">
                Description
              </Label>
              <Textarea
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Brief description of this category..."
                className="min-h-[100px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewCategoryName('');
                setNewCategoryDesc('');
              }}
              disabled={isAdding}
              className="flex-1 h-[44px] rounded-full border-2 border-border text-foreground hover:bg-secondary text-[17px] leading-[25px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={isAdding || !newCategoryName.trim()}
              className="flex-1 h-[44px] rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 text-[17px] leading-[25px]"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-[20px] font-semibold leading-[24px] text-foreground">
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-[16px] text-muted-foreground mt-1">
              Update category details
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <Label className="text-[12px] font-semibold leading-[16px] text-foreground mb-2 block">
                Category Name *
              </Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-[44px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]"
              />
            </div>
            <div>
              <Label className="text-[12px] font-semibold leading-[16px] text-foreground mb-2 block">
                Description
              </Label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="min-h-[100px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
              className="flex-1 h-[44px] rounded-full border-2 border-border text-foreground hover:bg-secondary text-[17px] leading-[25px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating || !editName.trim()}
              className="flex-1 h-[44px] rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 text-[17px] leading-[25px]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-danger" />
              </div>
              <div>
                <DialogTitle className="text-[20px] font-semibold leading-[24px] text-foreground">
                  Delete Category
                </DialogTitle>
                <DialogDescription className="text-[12px] leading-[16px] text-muted-foreground">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6">
            <p className="text-[17px] leading-[25px] text-foreground mb-4">
              Are you sure you want to delete{' '}
              <strong className="text-foreground">{deleteCategory?.name}</strong>?
              {deleteCategory?.startups && deleteCategory.startups.length > 0 && (
                <span className="block mt-2 text-danger">
                  This category contains {deleteCategory.startups.length} startup
                  {deleteCategory.startups.length !== 1 ? 's' : ''}.
                </span>
              )}
            </p>
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 h-[44px] rounded-full border-2 border-border text-foreground hover:bg-secondary text-[17px] leading-[25px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 h-[44px] rounded-full bg-danger text-primary-foreground hover:bg-danger/90 text-[17px] leading-[25px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}