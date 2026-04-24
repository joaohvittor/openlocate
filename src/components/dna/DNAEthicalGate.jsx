import React, { useState } from "react";
import { ShieldAlert, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function DNAEthicalGate({ onConfirm }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);

  const allChecked = checked1 && checked2 && checked3;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Authorization Required</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The DNA Analysis Module handles sensitive genetic data subject to legal restrictions.
            You must confirm authorization before proceeding.
          </p>
        </div>

        {/* Warning box */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-sm font-semibold">Legal & Ethical Notice</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 ml-6 list-disc">
            <li>DNA genetic data is highly sensitive and subject to privacy laws.</li>
            <li>Results are analytical only — not admissible as standalone legal proof.</li>
            <li>No centralized DNA database is created by this system.</li>
            <li>All analysis must be validated by a certified forensic expert.</li>
            <li>Unauthorized use of genetic data may constitute a criminal offence.</li>
          </ul>
        </div>

        {/* Confirmations */}
        <div className="bg-card border rounded-xl p-5 space-y-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">I confirm that:</p>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={checked1} onCheckedChange={setChecked1} className="mt-0.5" />
            <span className="text-sm leading-relaxed">
              This DNA analysis is <strong>legally authorized</strong> and conducted under proper investigative jurisdiction.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={checked2} onCheckedChange={setChecked2} className="mt-0.5" />
            <span className="text-sm leading-relaxed">
              I understand results are <strong>analytical only</strong> and require validation by a certified forensic expert before any legal use.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={checked3} onCheckedChange={setChecked3} className="mt-0.5" />
            <span className="text-sm leading-relaxed">
              I accept responsibility for the <strong>secure and lawful handling</strong> of all genetic data entered into this system.
            </span>
          </label>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!allChecked}
          onClick={onConfirm}
        >
          <Lock className="w-4 h-4 mr-2" />
          Confirm & Proceed to DNA Module
        </Button>

        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Your confirmation is logged for audit purposes.
        </p>
      </div>
    </div>
  );
}