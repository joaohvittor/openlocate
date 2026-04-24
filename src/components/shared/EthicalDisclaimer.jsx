import React from "react";
import { AlertTriangle } from "lucide-react";

export default function EthicalDisclaimer({ compact = false }) {
  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className={compact ? "text-xs font-medium text-warning" : "text-sm font-semibold text-warning"}>
            Ethical Use Notice
          </p>
          <p className={compact ? "text-[11px] text-muted-foreground mt-1" : "text-sm text-muted-foreground mt-1.5 leading-relaxed"}>
            Biometric similarity results are probabilistic and must never be used as the sole basis for identification. 
            Human verification and legal authorization are required.
          </p>
        </div>
      </div>
    </div>
  );
}