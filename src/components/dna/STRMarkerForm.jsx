import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload } from "lucide-react";

const DEFAULT_LOCI = [
  "D8S1179", "D21S11", "D7S820", "CSF1PO", "D3S1358",
  "TH01", "D13S317", "D16S539", "D2S1338", "D19S433",
  "vWA", "TPOX", "D18S51", "AMEL", "D5S818",
  "FGA", "D10S1248", "D22S1045", "D2S441", "D1S1656",
];

export default function STRMarkerForm({ markers = [], onChange }) {
  const [jsonError, setJsonError] = useState("");

  const updateMarker = (idx, field, value) => {
    const updated = markers.map((m, i) => i === idx ? { ...m, [field]: value } : m);
    onChange(updated);
  };

  const addLocus = () => {
    onChange([...markers, { locus: "", allele_1: "", allele_2: "" }]);
  };

  const removeLocus = (idx) => {
    onChange(markers.filter((_, i) => i !== idx));
  };

  const loadDefaults = () => {
    const defaults = DEFAULT_LOCI.map((locus) => ({
      locus,
      allele_1: "",
      allele_2: "",
    }));
    onChange(defaults);
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setJsonError("");
        const parsed = JSON.parse(ev.target.result);
        // Support array of {locus, allele_1, allele_2} or {locus, alleles: [a1,a2]}
        const normalized = (Array.isArray(parsed) ? parsed : parsed.markers || []).map((item) => ({
          locus: item.locus || item.marker || "",
          allele_1: item.allele_1 ?? (Array.isArray(item.alleles) ? item.alleles[0] : "") ?? "",
          allele_2: item.allele_2 ?? (Array.isArray(item.alleles) ? item.alleles[1] : "") ?? "",
        }));
        onChange(normalized);
      } catch {
        setJsonError("Invalid JSON format. Expected array of {locus, allele_1, allele_2}.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button type="button" size="sm" variant="outline" onClick={loadDefaults}>
          Load Standard Loci (CODIS)
        </Button>
        <label className="cursor-pointer">
          <Button type="button" size="sm" variant="outline" asChild>
            <span><Upload className="w-3 h-3 mr-1" /> Upload JSON</span>
          </Button>
          <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
        </label>
        <Button type="button" size="sm" variant="ghost" onClick={addLocus}>
          <Plus className="w-3 h-3 mr-1" /> Add Locus
        </Button>
      </div>

      {jsonError && (
        <p className="text-xs text-destructive mb-3">{jsonError}</p>
      )}

      {markers.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">No STR markers defined.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Load Standard Loci" or add manually.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-2 py-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Locus</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allele 1</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allele 2</p>
            <span />
          </div>

          {markers.map((m, idx) => (
            <div key={idx} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center">
              <Input
                value={m.locus}
                onChange={(e) => updateMarker(idx, "locus", e.target.value)}
                placeholder="e.g. D8S1179"
                className="h-8 text-xs font-mono"
              />
              <Input
                value={m.allele_1}
                onChange={(e) => updateMarker(idx, "allele_1", e.target.value)}
                placeholder="12"
                className="h-8 text-xs font-mono"
              />
              <Input
                value={m.allele_2}
                onChange={(e) => updateMarker(idx, "allele_2", e.target.value)}
                placeholder="14"
                className="h-8 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => removeLocus(idx)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}