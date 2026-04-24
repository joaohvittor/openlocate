import React from "react";
import { cn } from "@/lib/utils";

const statusStyles = {
  open: "bg-primary/10 text-primary",
  reviewing: "bg-warning/10 text-warning",
  closed: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  reviewed: "bg-primary/10 text-primary",
  flagged: "bg-destructive/10 text-destructive",
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

export default function StatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider",
      statusStyles[status] || "bg-muted text-muted-foreground"
    )}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}