import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

export default function RecentCases({ cases }) {
  if (!cases?.length) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-sm font-semibold mb-4">Recent Cases</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No cases yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-sm font-semibold">Recent Cases</h3>
        <Link to={createPageUrl("Cases")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y">
        {cases.slice(0, 5).map((c) => (
          <Link
            key={c.id}
            to={createPageUrl("CaseDetail") + `?id=${c.id}`}
            className="flex items-center justify-between p-4 px-5 hover:bg-muted/50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.created_date ? format(new Date(c.created_date), "MMM d, yyyy") : "—"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <StatusBadge status={c.status} />
              <StatusBadge status={c.priority} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}