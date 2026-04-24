import React from "react";
import { CheckCircle2, XCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DNAComparisonTable({ markerResults = [], sampleALabel, sampleBLabel }) {
  const matched = markerResults.filter((r) => r.match).length;
  const mismatched = markerResults.filter((r) => !r.match).length;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-success text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {matched} match{matched !== 1 ? "es" : ""}
        </div>
        <div className="flex items-center gap-1.5 text-destructive text-sm font-medium">
          <XCircle className="w-4 h-4" />
          {mismatched} mismatch{mismatched !== 1 ? "es" : ""}
        </div>
        {markerResults.length > 0 && (
          <div className="ml-auto text-xs text-muted-foreground">
            {markerResults.length} loci compared
          </div>
        )}
      </div>

      {/* Stacked progress */}
      {markerResults.length > 0 && (
        <div className="h-2 rounded-full overflow-hidden flex mb-5 bg-muted">
          <div
            className="bg-success transition-all"
            style={{ width: `${(matched / markerResults.length) * 100}%` }}
          />
          <div
            className="bg-destructive transition-all"
            style={{ width: `${(mismatched / markerResults.length) * 100}%` }}
          />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locus</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {sampleALabel || "Sample A"}
                </th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {sampleBLabel || "Sample B"}
                </th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {markerResults.map((row, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    "transition-colors",
                    row.match ? "bg-success/5 hover:bg-success/10" : "bg-destructive/5 hover:bg-destructive/10"
                  )}
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold">{row.locus}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs">
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {row.allele_a1 || "—"}, {row.allele_a2 || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs">
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {row.allele_b1 || "—"}, {row.allele_b2 || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.match ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Match
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Mismatch
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {markerResults.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                    No loci data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}