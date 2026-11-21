import type { ReactElement } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "./ui/utils";

type AlertType = "error" | "success" | "warning" | "info";

type AlertProps = {
  message: string;
  type: AlertType;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  onDismiss?: () => void;
  className?: string;
};

const alertStyles: Record<AlertType, { container: string; icon: string; defaultTitle: string; iconNode: ReactElement }> = {
  error: {
    container: "bg-danger/10 border-danger/30 text-danger",
    icon: "text-danger",
    defaultTitle: "Error",
    iconNode: <AlertCircle className="h-5 w-5" />,
  },
  success: {
    container: "bg-success/10 border-success/30 text-success",
    icon: "text-success",
    defaultTitle: "Success",
    iconNode: <CheckCircle2 className="h-5 w-5" />,
  },
  warning: {
    container: "bg-warning/10 border-warning/30 text-warning",
    icon: "text-warning",
    defaultTitle: "Warning",
    iconNode: <TriangleAlert className="h-5 w-5" />,
  },
  info: {
    container: "bg-primary/10 border-primary/30 text-primary",
    icon: "text-primary",
    defaultTitle: "Info",
    iconNode: <Info className="h-5 w-5" />,
  },
};

export default function Alert({
  message,
  type,
  title,
  actionLabel,
  onAction,
  actionDisabled,
  onDismiss,
  className,
}: AlertProps) {
  if (!message) return null;

  const styles = alertStyles[type];

  return (
    <div
      role="alert"
      className={cn(
        "mb-4 rounded-2xl border p-4 shadow-sm",
        styles.container,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0", styles.icon)}>{styles.iconNode}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold leading-5">
                {title || styles.defaultTitle}
              </p>
              <p className="mt-1 text-sm leading-5 opacity-90">{message}</p>
            </div>

            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-md p-1 text-current/60 transition-colors hover:bg-black/5 hover:text-current"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {actionLabel && onAction ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={onAction}
                variant={type === "error" || type === "warning" ? "destructive" : "default"}
                size="sm"
                className="rounded-full"
                disabled={actionDisabled}
              >
                {actionLabel}
              </Button>

              {onDismiss ? (
                <Button type="button" onClick={onDismiss} variant="outline" size="sm" className="rounded-full">
                  Cancel
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}