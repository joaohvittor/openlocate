import React from "react";
import { cn } from "@/lib/utils";

export default function CorrespondenceGauge({ ratio, level, lociCompared, lociMatched, lociMismatched }) {
  const color =
    level === "high correspondence"
      ? "text-warning"
      : level === "moderate correspondence"
      ? "text-primary"
      : "text-success";

  const bgColor =
    level === "high correspondence"
      ? "bg-warning/10"
      : level === "moderate correspondence"
      ? "bg-primary/10"
      : "bg-success/10";

  const ringColor =
    level === "high correspondence"
      ? "border-warning/40"
      : level === "moderate correspondence"
      ? "border-primary/40"
      : "border-success/40";

  const barColor =
    level === "high correspondence"
      ? "bg-warning"
      : level === "moderate correspondence"
      ? "bg-primary"
      : "bg-success";

  return (
    <div className={cn("rounded-xl border p-6", bgColor, ringColor)}>
      {/* Main score */}
      <div className="text-center mb-4">
        <p className={cn("text-6xl font-bold tabular-nums", color)}>{ratio}%</p>
        <p className={cn("text-sm font-semibold mt-2 capitalize", color)}>{level}</p>
      </div>

      {/* Bar */}
      <div className="h-2.5 bg-white/30 rounded-full overflow-hidden mb-5">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${ratio}%` }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{lociCompared}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Loci Compared</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-success">{lociMatched}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Matched</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive">{lociMismatched}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Mismatched</p>
        </div>
      </div>

      {/* Legal warning */}
      <p className="text-[11px] text-center text-muted-foreground mt-5 border-t pt-4">
        ⚠ DNA comparison results are analytical and must be validated by certified forensic experts.
      </p>
    </div>
  );
}