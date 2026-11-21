import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface GuestActionBannerProps {
  action: 'like' | 'bookmark' | 'comment' | 'follow';
  className?: string;
}

const actionMessages = {
  like: 'Want to like this startup?',
  bookmark: 'Want to save this startup?',
  comment: 'Want to join the conversation?',
  follow: 'Want to follow this founder?',
};

export default function GuestActionBanner({ action, className = '' }: GuestActionBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border-2 border-dashed border-warning/40 bg-warning/10  ${className}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <Lock className="w-5 h-5 text-warning shrink-0" />
        <div>
          <p className="text-sm font-medium text-text ">
            {actionMessages[action]}
          </p>
          <p className="text-xs text-text-muted ">
            Please register to continue.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => navigate('/login')}
          className="text-warning hover:bg-warning/10"
        >
          Login
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => navigate('/register')}
          className="bg-warning hover:bg-warning/90 text-white"
        >
          Register
        </Button>
      </div>
    </div>
  );
}
