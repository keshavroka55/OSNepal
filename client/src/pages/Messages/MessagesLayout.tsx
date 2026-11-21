// client/src/pages/Messages/MessagesLayout.tsx
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import PendingRequests from './PendingRequests';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function MessagesLayout() {
  const { userId } = useParams();
  const navigate = useNavigate();

  return (
    <>

      <div className="min-h-full bg-background pt-0 text-foreground">
        <div className="mx-auto h-[calc(100dvh-7.5rem)] w-full  sm:h-[calc(100dvh-8rem)] sm:max-w-6xl sm:rounded-xl sm:border sm:border-border sm:shadow-[0_1px_3px_rgba(0,0,0,0.02),0_8px_32px_-16px_rgba(17,35,79,0.10)] sm:overflow-hidden">
          <div className="flex h-full flex-col overflow-hidden bg-card">
            {/* Mobile header */}
            <div
              className={`${
                userId ? 'hidden' : 'flex'
              } items-center gap-3 border-b border-border px-4 py-3 sm:hidden`}
            >
              <button
                type="button"
                onClick={() => navigate('/home')}
                aria-label="Back"
                className="-ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <h1 className="text-[15px] font-semibold">Messages</h1>
            </div>

            {/* Sidebar + Chat */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Left sidebar */}
              <aside
                className={`
                  ${userId ? 'hidden sm:flex' : 'flex'}
                  w-full flex-col overflow-y-auto
                  border-border
                  sm:w-[320px] sm:border-r
                `}
              >
                <PendingRequests />
                <ConversationList />
              </aside>

              {/* Chat / Empty state */}
              <div
                className={`
                  ${userId ? 'flex' : 'hidden sm:flex'}
                  min-h-0 min-w-0 flex-1 flex-col
                  items-center justify-center gap-3
                `}
              >
                {userId ? (
                  <Outlet />
                ) : (
                  <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">
                        Your messages
                      </p>
                      <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                        Select a conversation to start chatting, or browse the
                        community to connect with someone new.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/home')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[12px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Home
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}