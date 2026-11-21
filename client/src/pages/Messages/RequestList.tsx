// client/src/pages/Messages/RequestList.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import PendingRequests from './PendingRequests';

export default function RequestList() {
  const navigate = useNavigate();

  return (
    <>

      <div className="min-h-full bg-background pt-0 text-foreground">
        <div className="mx-auto h-[calc(100dvh-7.5rem)] w-full  sm:h-[calc(100dvh-8rem)] sm:max-w-2xl sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:shadow-[0_1px_3px_rgba(0,0,0,0.02),0_8px_32px_-16px_rgba(17,35,79,0.10)]">
          <div className="flex h-full flex-col overflow-hidden bg-card">
            {/* Header */}
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button
                type="button"
                onClick={() => navigate('/home')}
                aria-label="Back"
                className="-ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h1 className="text-[15px] font-semibold">Connection Requests</h1>
              </div>
            </header>

            {/* Request List */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PendingRequests />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}