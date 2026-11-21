// pages/DashboardPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Pencil, Rocket, Trash2, Users } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import Alert from '../../components/Alert';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { getDashboardStatsAPI } from '../../features/admin/adminService';
import { deleteStartupAPI, updateStartupAPI, type StartupStatus } from '../../features/startups/startup.service';


type Project = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logo?: string | null;
  status: string;
  totalVotes: number;
  totalComments: number;
  createdAt: string;
  founder?: {
    id: string;
    name: string;
    username: string;
    avatar?: string | null;
  };
};

type BannerAlert = {
  type: 'error' | 'success';
  title: string;
  message: string;
};

const STATUS_OPTIONS: StartupStatus[] = ['draft', 'pending', 'published', 'rejected', 'archived'];

export default function DashboardPage() {
  const { resolvedTheme: theme } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ developers: 0, investors: 0, pendingMarks: 0, backedProjects: 0, joinRequests: 0, totalUsers: 0, totalProjects: 0, totalLikes: 0, totalComments: 0, totalPosts: 0, openReports: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [permissions, setPermissions] = useState({ canUpdateProjects: false, canDeleteProjects: false, canManageUsers: false });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', tagline: '', status: 'draft' as StartupStatus });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [bannerAlert, setBannerAlert] = useState<BannerAlert | null>(null);

  const dark = theme === 'dark';

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object') {
      const response = error as { response?: { data?: { message?: string } }; message?: string };
      const serverMessage = response.response?.data?.message;
      if (serverMessage) return serverMessage;
      if (response.message) return response.message;
    }

    return error instanceof Error && error.message ? error.message : fallback;
  };

  const loadDashboard = async () => {
    const data = await getDashboardStatsAPI();
    setSummary((prev) => ({ ...prev, ...data.summary }));
    setProjects(data.recentProjects || []);
    setPermissions(data.permissions || { canUpdateProjects: false, canDeleteProjects: false, canManageUsers: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== 'admin') {
        setLoading(false);
        return;
      }

      try {
        await loadDashboard();
      } catch {
        toast.error('Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role]);

  const statCards = useMemo(() => ([
    { label: 'Total Users', value: summary.totalUsers, icon: Users, color: 'bg-primary' },
    { label: 'Developers', value: summary.developers, icon: Users, color: 'bg-primary' },
    { label: 'Investors', value: summary.investors, icon: Users, color: 'bg-primary' },
    { label: 'Investor marks pending', value: summary.pendingMarks, icon: Rocket, color: summary.pendingMarks > 0 ? 'bg-danger' : 'bg-primary' },
    { label: 'Investor-backed projects', value: summary.backedProjects, icon: Rocket, color: 'bg-primary' },
    { label: 'Join requests', value: summary.joinRequests, icon: Users, color: 'bg-primary' },
    { label: 'Submitted Projects', value: summary.totalProjects, icon: Rocket, color: 'bg-primary' },
    { label: 'Total Likes', value: summary.totalLikes, icon: Heart, color: 'bg-primary' },
    { label: 'Total Comments', value: summary.totalComments, icon: MessageCircle, color: 'bg-primary' },
    { label: 'Ecosystem Posts', value: summary.totalPosts, icon: MessageCircle, color: 'bg-primary' },
    { label: 'Open Reports', value: summary.openReports, icon: Rocket, color: summary.openReports > 0 ? 'bg-danger' : 'bg-primary' },
  ]), [summary]);

  const openEdit = (project: Project) => {
    setSelectedProject(project);
    setForm({
      name: project.name,
      tagline: project.tagline,
      status: (STATUS_OPTIONS.includes(project.status as StartupStatus) ? project.status : 'draft') as StartupStatus,
    });
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    setSaving(true);
    try {
      await updateStartupAPI(selectedProject.id, {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        status: form.status,
      });

      toast.success('Project updated');
      setSelectedProject(null);
      await loadDashboard();
    } catch (error: any) {
      const message = getErrorMessage(error, 'Unable to update project');
      setBannerAlert({ type: 'error', title: 'Update failed', message });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (project: Project) => {
    setBannerAlert(null);
    setProjectToDelete(project);
  };

  const cancelDelete = () => {
    if (deletingId) return;
    setProjectToDelete(null);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    const project = projectToDelete;
    setDeletingId(project.id);
    try {
      await deleteStartupAPI(project.id);

      toast.success('Project deleted');
      setBannerAlert({
        type: 'success',
        title: 'Project deleted',
        message: `${project.name} was deleted successfully.`,
      });
      setProjectToDelete(null);
      await loadDashboard();
    } catch (error: any) {
      const message = getErrorMessage(error, 'Unable to delete project');
      setBannerAlert({ type: 'error', title: 'Delete failed', message });
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (user && user.role !== 'admin') {
    return (
      <div className="flex h-screen bg-card">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <h1 className="text-foreground text-[28px] font-semibold leading-[32px] mb-3">
              Access denied
            </h1>
            <p className="text-muted-foreground text-[17px] leading-[25px]">
              This dashboard is available to administrators only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-card">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-[17px] leading-[25px]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-card">
      <DashboardSidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1262px] mx-auto px-5 md:px-6 lg:px-8 py-8 md:py-12 space-y-8">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-[12px] font-normal leading-[16px]">
              ADMIN PANEL
            </span>
            <h1 className="text-foreground text-[40px] md:text-[48px] font-semibold leading-[44px] md:leading-[52px]">
              Admin Dashboard
            </h1>
            <p className="text-foreground text-[17px] font-normal leading-[25px]">
              Welcome back, <span className="text-primary font-semibold">{user?.name}</span>. Quick platform overview and project controls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 border border-border bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[12px] text-muted-foreground leading-[16px]">{stat.label}</p>
                        <p className="text-[28px] font-semibold leading-[32px] text-foreground mt-2">{stat.value}</p>
                      </div>
                      <div className="bg-secondary rounded-full p-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="border border-border bg-card">
            <div className="p-6 flex items-center justify-between gap-4 border-b border-border">
              <div>
                <h2 className="text-[24px] font-semibold leading-[28px] text-foreground">Recent Projects</h2>
                <p className="text-[12px] leading-[16px] text-muted-foreground mt-1">
                  Manage the latest submitted products from founders.
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground rounded-full text-[12px] leading-[16px]">
                {permissions.canUpdateProjects && permissions.canDeleteProjects ? 'Admin actions enabled' : 'Read only'}
              </Badge>
            </div>

            {bannerAlert ? (
              <div className="px-6 pt-6">
                <Alert
                  type={bannerAlert.type}
                  title={bannerAlert.title}
                  message={bannerAlert.message}
                  onDismiss={() => setBannerAlert(null)}
                />
              </div>
            ) : null}

            {projectToDelete ? (
              <div className="px-6 pt-6">
                <Alert
                  type="warning"
                  title={`Delete ${projectToDelete.name}?`}
                  message="This action permanently removes the project and cannot be undone."
                  actionLabel={deletingId === projectToDelete.id ? 'Deleting...' : 'Delete project'}
                  onAction={handleDelete}
                  actionDisabled={Boolean(deletingId)}
                  onDismiss={deletingId ? undefined : cancelDelete}
                />
              </div>
            ) : null}

            {projects.length === 0 ? (
              <div className="p-6 text-[17px] leading-[25px] text-muted-foreground">No projects submitted yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-4 px-6 text-[12px] font-semibold text-muted-foreground leading-[16px]">Project</th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-muted-foreground leading-[16px]">Founder</th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-muted-foreground leading-[16px]">Likes</th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-muted-foreground leading-[16px]">Comments</th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-muted-foreground leading-[16px]">Status</th>
                      <th className="py-4 px-6 text-[12px] font-semibold text-muted-foreground leading-[16px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b border-border hover:bg-accent transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                              {project.logo ? (
                                <img src={project.logo} alt={project.name} className="h-full w-full object-cover" />
                              ) : (
                                <Rocket className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-[17px] font-semibold leading-[21px] text-foreground">{project.name}</p>
                              <p className="text-[12px] leading-[16px] text-muted-foreground line-clamp-1">{project.tagline}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[17px] leading-[25px] text-foreground">{project.founder?.name || '—'}</td>
                        <td className="py-4 px-6 text-[17px] leading-[25px] text-foreground">{project.totalVotes}</td>
                        <td className="py-4 px-6 text-[17px] leading-[25px] text-foreground">{project.totalComments}</td>
                        <td className="py-4 px-6">
                          <Badge className={`rounded-full text-[12px] leading-[16px] ${
                            project.status === 'published'
                              ? 'bg-success/10 text-success'
                              : project.status === 'pending'
                                ? 'bg-warning/10 text-warning'
                                : project.status === 'rejected'
                                  ? 'bg-danger/10 text-danger'
                                  : project.status === 'archived'
                                    ? 'bg-surface-raised text-text'
                                    : 'bg-secondary text-muted-foreground'
                          }`}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!permissions.canUpdateProjects}
                              onClick={() => openEdit(project)}
                              className="h-[32px] rounded-full text-muted-foreground hover:text-primary hover:bg-transparent"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!permissions.canDeleteProjects || Boolean(deletingId)}
                              onClick={() => requestDelete(project)}
                              className="h-[32px] rounded-full text-muted-foreground hover:text-danger hover:bg-transparent"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={Boolean(selectedProject)} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-[20px] font-semibold leading-[24px] text-foreground">
              Edit Project
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold leading-[16px] text-foreground">
                Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="h-[44px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold leading-[16px] text-foreground">
                Tagline
              </label>
              <Input
                value={form.tagline}
                onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                className="h-[44px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold leading-[16px] text-foreground">
                Status
              </label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as StartupStatus }))}>
                <SelectTrigger className="h-[44px] rounded-lg border-border text-[17px] leading-[25px] focus:border-primary focus:ring-[3px] focus:ring-[rgba(0,113,227,0.1)]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedProject(null)}
                className="h-[44px] rounded-full border-2 border-border text-foreground hover:bg-secondary text-[17px] leading-[25px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-[44px] rounded-full bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 text-[17px] leading-[25px]"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}