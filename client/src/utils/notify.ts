import { toast } from 'sonner';

type Notify = {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  toast: (msg: string) => void;
};

export const notify: Notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast(msg),
  toast: (msg: string) => toast(msg),
};

export default notify;
