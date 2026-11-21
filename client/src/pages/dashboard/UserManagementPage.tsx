// pages/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Trash2, ShieldCheck, UserCog, Users, Shield, Check, Loader2 } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsersAPI, deleteUserAPI, updateUserRoleAPI } from '../../features/users/userService';

import { toast } from 'sonner';
import { notify } from '../../utils/notify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  verified?: boolean;
  reputationPoints?: number;
};

export default function UserManagementPage() {
  const { resolvedTheme: theme } = useTheme();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Fetch all users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsersAPI();
        setUsers(data);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Open delete confirmation
  const handleDelete = (userId: string, userName: string) => {
    const u = users.find(x => x.id === userId) || null;
    setUserToDelete(u);
    setDeleteSuccess(false);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserAPI(userToDelete.id);
      // assume API returns an object with message or success
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setDeleteSuccess(true);
      notify.success(`${userToDelete.name} has been deleted`);
      setTimeout(() => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setDeleteSuccess(false);
      }, 900);
    } catch (err: any) {
      console.error('Delete user error:', err);
      notify.error(err?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Update role
  const handleRoleChange = async (userId: string, userName: string, newRole: 'user' | 'admin') => {
    setActionLoading(userId);
    try {
      const res = await updateUserRoleAPI(userId, newRole);
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
        );
        toast.success(`${userName}'s role updated to ${newRole}`);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to update role');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary text-primary-foreground';
      case 'user':  return 'bg-secondary text-foreground';
      default:      return 'bg-secondary text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':  return 'User';
      case 'admin': return 'Admin';
      default:      return role;
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex h-screen bg-card">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <h1 className="text-foreground text-[28px] font-semibold leading-[32px] mb-3">
              Access Denied
            </h1>
            <p className="text-muted-foreground text-[17px] leading-[25px]">
              Only administrators can access this page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-card">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1262px] mx-auto px-5 md:px-6 lg:px-8 py-8 md:py-12">

          {/* Header */}
          <div className="mb-8">
            <span className="text-muted-foreground text-[12px] font-normal leading-[16px]">
              ADMIN PANEL
            </span>
            <h1 className="text-foreground text-[40px] md:text-[48px] font-semibold leading-[44px] md:leading-[52px] mt-2 mb-2">
              User Management
            </h1>
            <p className="text-foreground text-[17px] font-normal leading-[25px]">
              {loading ? 'Loading...' : `${users.length} total users`}
            </p>
          </div>

          {/* Stats Row */}
          {!loading && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Users', role: 'user', icon: Users },
                { label: 'Admins', role: 'admin', icon: Shield },
              ].map(({ label, role, icon: Icon }) => (
                <Card key={role} className="p-5 border border-border bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-muted-foreground leading-[16px]">{label}</p>
                      <p className="text-[28px] font-semibold leading-[32px] text-foreground mt-1">
                        {users.filter(u => u.role === role).length}
                      </p>
                    </div>
                    <div className="bg-secondary rounded-full p-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Filters */}
          <Card className="p-6 border border-border bg-card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-[44px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-[44px] rounded-full border-border text-[17px] leading-[25px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          {deleteSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <DialogTitle className="text-[24px] font-semibold leading-[28px] text-foreground mb-2">
                Deleted Successfully
              </DialogTitle>
              <DialogDescription className="text-[17px] leading-[25px] text-muted-foreground">
                {userToDelete?.name} has been permanently deleted.
              </DialogDescription>
            </motion.div>
          ) : (
            <>
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-danger" />
                  </div>
                  <div>
                    <DialogTitle className="text-[20px] font-semibold leading-[24px] text-foreground">
                      Delete User
                    </DialogTitle>
                    <DialogDescription className="text-[12px] leading-[16px] text-muted-foreground">
                      This action cannot be undone
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6 pb-6">
                <p className="text-[17px] leading-[25px] text-foreground mb-4">
                  Are you sure you want to delete this user?
                </p>

                <div className="p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-card flex items-center justify-center">
                      {userToDelete?.avatar ? (
                        <img src={userToDelete.avatar} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        <span className="text-[14px] font-semibold text-muted-foreground">
                          {userToDelete?.name?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold leading-[18px] text-foreground">
                        {userToDelete?.name}
                      </p>
                      <p className="text-[12px] leading-[16px] text-muted-foreground">
                        {userToDelete?.email} • {getRoleLabel(userToDelete?.role || 'user')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 pt-0 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setDeleteDialogOpen(false); setUserToDelete(null); }}
                  disabled={isDeleting}
                  className="flex-1 h-[44px] rounded-full border-2 border-border text-foreground hover:bg-secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-[44px] rounded-full bg-danger text-primary-foreground hover:bg-danger/90"
                >
                  {isDeleting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" /> Delete User</>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

          {/* Table */}
          <Card className="border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    {['User', 'Email', 'Role', 'Reputation', 'Verified', 'Joined', 'Actions'].map(h => (
                      <TableHead key={h} className="text-[12px] font-semibold text-muted-foreground leading-[16px]">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-[17px] leading-[25px]">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-[17px] leading-[25px]">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u, index) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-b border-border hover:bg-accent transition-colors ${
                          actionLoading === u.id ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {/* User */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-full">
                              <AvatarImage src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0071E3&color=fff`} />
                              <AvatarFallback className="bg-secondary text-muted-foreground">
                                {u.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[17px] font-semibold leading-[21px] text-foreground">
                              {u.name}
                              {u.id === currentUser?.id && (
                                <span className="ml-2 text-[12px] text-primary">(you)</span>
                              )}
                            </span>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="text-[17px] leading-[25px] text-muted-foreground">
                          {u.email}
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Badge className={`rounded-full text-[12px] leading-[16px] ${getRoleBadgeColor(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </Badge>
                        </TableCell>

                        {/* Reputation */}
                        <TableCell className="text-[17px] leading-[25px] text-foreground">
                          {u.reputationPoints || 0}
                        </TableCell>

                        {/* Verified */}
                        <TableCell>
                          <Badge className={`rounded-full text-[12px] leading-[16px] ${
                            u.verified 
                              ? 'bg-success/10 text-success' 
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            {u.verified ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>

                        {/* Joined */}
                        <TableCell className="text-[12px] leading-[16px] text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          {u.id !== currentUser?.id ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-[32px] w-[32px] rounded-full text-muted-foreground hover:text-primary hover:bg-transparent"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Role change submenu */}
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(u.id, u.name, 'user')}
                                  disabled={u.role === 'user'}
                                  className="text-[17px] leading-[25px]"
                                >
                                  <UserCog className="w-4 h-4 mr-2" />
                                  Set as User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(u.id, u.name, 'admin')}
                                  disabled={u.role === 'admin'}
                                  className="text-[17px] leading-[25px]"
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                                  Set as Admin
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="text-danger focus:text-danger text-[17px] leading-[25px]"
                                  onClick={() => handleDelete(u.id, u.name)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-[12px] text-text-muted px-3">—</span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}