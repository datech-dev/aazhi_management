import { LucideIcon, FolderOpen } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 lg:p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold font-heading text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">{description}</p>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className={buttonVariants({
                className: "bg-primary text-primary-foreground hover:bg-primary/90",
              })}
            >
              {actionLabel}
            </Link>
          ) : (
            <Button onClick={onAction} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
