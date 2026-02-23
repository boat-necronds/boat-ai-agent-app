import { cn } from "@workspace/ui/lib/utils";
import { AlertCircle } from "lucide-react";

export type EmptyStateProps = {
  /** Main message */
  message: string;
  /** Secondary line (description) */
  description?: string;
  /** Title (above message) */
  title?: string;
  /** Icon — optional, default icon used if not provided */
  icon?: React.ReactNode;
  /** Variant: default (empty/no data), error */
  variant?: "default" | "error";
  /** Extra class for wrapper */
  className?: string;
};

export function EmptyState({
  message,
  description,
  title,
  icon,
  variant = "default",
  className,
}: EmptyStateProps) {
  const defaultIcon =
    variant === "error" ? (
      <AlertCircle className="size-10 text-destructive" />
    ) : null;

  const displayIcon = icon ?? defaultIcon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        variant === "error" && "text-destructive [&_.empty-state-message]:text-destructive",
        className
      )}
      role={variant === "error" ? "alert" : undefined}
    >
      {displayIcon && (
        <div className="mb-3 flex justify-center">{displayIcon}</div>
      )}
      {title && (
        <p className="text-sm font-medium text-foreground empty-state-title">
          {title}
        </p>
      )}
      <p className="empty-state-message text-sm text-muted-foreground">
        {message}
      </p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/80 empty-state-description">
          {description}
        </p>
      )}
    </div>
  );
}
