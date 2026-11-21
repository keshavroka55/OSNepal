import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../contexts/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

// Route-level code splitting: each page loads only when visited.
const page = (loader: () => Promise<{ default: React.ComponentType<any> }>) => lazy(loader);
const named = <T extends string>(loader: () => Promise<Record<T, React.ComponentType<any>>>, key: T) =>
  lazy(async () => ({ default: (await loader())[key] }));

const SplashPage = page(() => import('../pages/landing_page/SplashPage'));
const AppShell = page(() => import('../components/shell/AppShell'));
const LoginPage = page(() => import('../pages/auth/LoginPage'));
const RegisterPage = page(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = page(() => import('../pages/auth/ForgotPasswordEmailVerifyPage'));
const ResetPasswordPage = page(() => import('../pages/auth/ResetPasswordPage'));
const PrivacyPage = page(() => import('../pages/legal/PrivacyPage'));
const TermsPage = page(() => import('../pages/legal/TermsPage'));
const CookiesPage = page(() => import('../pages/legal/CookiesPage'));

const Onboarding = page(() => import('../pages/nepal/Onboarding'));
const Home = page(() => import('../pages/nepal/Home'));
const Discover = page(() => import('../pages/nepal/Discover'));
const ProjectDetail = page(() => import('../pages/nepal/ProjectDetail'));
const CreateProject = page(() => import('../pages/nepal/CreateProject'));
const People = page(() => import('../pages/nepal/People'));
const Leaderboard = page(() => import('../pages/nepal/Leaderboard'));
const Ideas = page(() => import('../pages/nepal/Ideas'));
const Profile = page(() => import('../pages/nepal/Profile'));
const ProfileEdit = page(() => import('../pages/nepal/ProfileEdit'));
const JoinRequests = named(() => import('../pages/nepal/Workspace'), 'JoinRequests');
const Saved = named(() => import('../pages/nepal/Workspace'), 'Saved');
const MyProjects = named(() => import('../pages/nepal/Workspace'), 'MyProjects');
const Notifications = named(() => import('../pages/nepal/Workspace'), 'Notifications');
const InvestorHub = named(() => import('../pages/nepal/Investor'), 'InvestorHub');
const AdminInvestorMarks = named(() => import('../pages/nepal/Investor'), 'AdminInvestorMarks');

const Dashboard = page(() => import('../pages/dashboard/Dashboard'));
const CategoryManagement = page(() => import('../pages/dashboard/CategoryManagementPage'));
const UserManagement = page(() => import('../pages/dashboard/UserManagementPage'));
const ModerationQueue = page(() => import('../pages/dashboard/ModerationQueuePage'));

const MessagesLayout = page(() => import('../pages/Messages/MessagesLayout'));
const ChatPage = page(() => import('../pages/Messages/ChatPage'));
const ConnectPage = page(() => import('../pages/Messages/ConnectPage'));
const RequestList = page(() => import('../pages/Messages/RequestList'));
const EcosystemPage = page(() => import('../pages/ecosystem/EcosystemPage'));
const SpacePage = page(() => import('../pages/ecosystem/SpacePage'));
const PostPage = page(() => import('../pages/ecosystem/PostPage'));
const NewPostPage = page(() => import('../pages/ecosystem/NewPostPage'));

// Old MakeSuperAI-era links keep working.
const LEGACY_REDIRECTS: Record<string, string> = {
  '/products': '/discover',
  '/submit': '/create',
  '/explore': '/discover',
  '/privacy-policy': '/privacy',
  '/terms-of-service': '/terms',
  '/cookie': '/cookies',
  '/connect': '/people',
};

function ProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/projects/${id}`} replace />;
}

/** Admin pages bring their own sidebar; this only guards them. */
function AdminFrame({ children }: { children: React.ReactNode }) {
  const { user, authChecked } = useAuth() as { user: { role: string } | null; authChecked: boolean };
  if (!authChecked) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <div className="flex min-h-screen bg-background"><DashboardSidebar /><main className="flex-1 pt-16 lg:pt-0">{children}</main></div>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-text-muted" role="status">Loading…</div>}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Admin console (own layout) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/categories" element={<CategoryManagement />} />
        <Route path="/dashboard/users" element={<UserManagement />} />
        <Route path="/dashboard/moderation" element={<ModerationQueue />} />
        <Route path="/dashboard/investor-marks" element={<AdminFrame><AdminInvestorMarks /></AdminFrame>} />

        {/* App shell: readable by guests where it makes sense, actions prompt sign-in */}
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/projects/:slug/edit" element={<CreateProject />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/join-requests" element={<JoinRequests />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile own />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/startups" element={<Discover presetType="STARTUP" />} />
          <Route path="/open-source" element={<Discover presetType="OPEN_SOURCE" />} />
          <Route path="/projects" element={<Navigate to="/discover" replace />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/products/:id" element={<ProductRedirect />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/people" element={<People />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="/ecosystem/new" element={<NewPostPage />} />
          <Route path="/ecosystem/s/:slug" element={<SpacePage />} />
          <Route path="/ecosystem/s/:slug/post/:postId" element={<PostPage />} />
          <Route path="/investor" element={<InvestorHub />} />
          <Route path="/requests" element={<RequestList />} />
          <Route path="/connections" element={<ConnectPage />} />
          <Route path="/messages" element={<MessagesLayout />}>
            <Route path=":userId" element={<ChatPage />} />
          </Route>
        </Route>

        {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => <Route key={from} path={from} element={<Navigate to={to} replace />} />)}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
