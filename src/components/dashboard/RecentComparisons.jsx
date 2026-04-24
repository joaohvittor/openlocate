import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

export default function RecentComparisons({ comparisons }) {
  if (!comparisons?.length) {
    return (
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-sm font-semibold mb-4">Recent Comparisons</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No comparisons yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="text-sm font-semibold">Recent Comparisons</h3>
        <Link to={createPageUrl("AnalysisHistory")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y">
        {comparisons.slice(0, 5).map((comp) => (
          <Link
            key={comp.id}
            to={createPageUrl("AnalysisResult") + `?id=${comp.id}`}
            className="flex items-center justify-between p-4 px-5 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-2">
                {comp.image_a_url && (
                  <img src={comp.image_a_url} className="w-8 h-8 rounded-md border-2 border-card object-cover" alt="" />
                )}
                {comp.image_b_url && (
                  <img src={comp.image_b_url} className="w-8 h-8 rounded-md border-2 border-card object-cover" alt="" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  Score: {comp.similarity_score != null ? `${comp.similarity_score}%` : "Pending"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {comp.created_date ? format(new Date(comp.created_date), "MMM d, yyyy h:mm a") : "—"}
                </p>
              </div>
            </div>
            <StatusBadge status={comp.status || "pending"} />
          </Link>
        ))}
      </div>
    </div>
  );
}