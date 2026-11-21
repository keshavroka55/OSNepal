import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';

type RequireAuth = (reason?: string) => boolean;

const RequireAuthContext = createContext<RequireAuth>(() => true);

// Logged-out visitors can read everything. Any action calls requireAuth();
// if it returns false a sign-in prompt opens, and after signing in the user
// is sent back to the page they were on.
export function RequireAuthProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [reason, setReason] = useState<string | null>(null);

  const requireAuth = useCallback<RequireAuth>(
    (why = 'do that') => {
      if (user) return true;
      setReason(why);
      return false;
    },
    [user],
  );

  const from = location.pathname + location.search;

  return (
    <RequireAuthContext.Provider value={requireAuth}>
      {children}
      <Dialog open={reason !== null} onOpenChange={(open) => !open && setReason(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
            <DialogDescription>You need an account to {reason}.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/login" state={{ from }} onClick={() => setReason(null)}>Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register" state={{ from }} onClick={() => setReason(null)}>Create account</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </RequireAuthContext.Provider>
  );
}

export const useRequireAuth = () => useContext(RequireAuthContext);
