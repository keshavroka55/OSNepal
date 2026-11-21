import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Footer } from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import { SocketProvider } from './contexts/SocketContext';
import { RequireAuthProvider } from './features/ecosystem/hooks/useRequireAuth';

export default function App() {
  const { pathname } = useLocation();
  // The chat screen needs the full viewport height.
  // The footer belongs to public pages only; signed-in screens use the app shell.
  const PUBLIC = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/privacy', '/terms', '/cookies'];
  const hideFooter = !PUBLIC.includes(pathname);

  return (
    <SocketProvider>
      <RequireAuthProvider>
        <div className="flex min-h-screen flex-col">
          <ScrollToTop />
          <div className="grow">
            <AppRoutes />
          </div>
          {!hideFooter && <Footer />}
          <Toaster richColors position="top-right" />
        </div>
      </RequireAuthProvider>
    </SocketProvider>
  );
}
