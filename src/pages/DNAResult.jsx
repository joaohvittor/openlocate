// src/pages/DNAResult.jsx
import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { DNAComparison as DNAComp } from "@/api/entities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const levelColor = {
  "high correspondence":     "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "moderate correspondence": "bg-amber-500/10 text-amber-700 border-amber-200",
  "low correspondence":      "bg-red-500/10 text-red-700 border-red-200",
}

export default function DNAResult() {
  const [params] = useSearchParams()
  const id = params.get("id")
  const [comp, setComp]   = useState(null)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!id) return
    DNAComp.get(id).then(c => { setComp(c); setNotes(c.investigator_notes || "") }).finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await DNAComp.update(id, { investigator_notes: notes, status: "reviewed" })
      toast({ title: "Notes saved" })
    } catch {
      toast({ title: "Error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
  if (!comp) return <div className="text-center py-20 text-muted-foreground">Result not found.</div>

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link to={createPageUrl("DNAHistory")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> DNA History
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">DNA Comparison Result</h1>
        <p className="text-muted-foreground text-sm mt-1">{new Date(comp.created_date).toLocaleString("pt-BR")}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Loci Compared", value: comp.loci_compared },
          { label: "Matched",       value: comp.loci_matched,    color: "text-emerald-600" },
          { label: "Mismatched",    value: comp.loci_mismatched, color: "text-red-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4 text-center">
              <p className={`text-3xl font-bold ${s.color || ""}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold tabular-nums">{comp.similarity_ratio?.toFixed(1)}%</span>
        <span className={`text-sm px-3 py-1 rounded-full border font-medium ${levelColor[comp.correspondence_level] || ""}`}>
          {comp.correspondence_level}
        </span>
      </div>

      {/* Marker table */}
      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Marker Results</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Locus</th>
                  <th className="text-left py-2 pr-3 font-medium">{comp.sample_a_label}</th>
                  <th className="text-left py-2 pr-3 font-medium">{comp.sample_b_label}</th>
                  <th className="text-left py-2 font-medium">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(comp.marker_results || []).map(r => (
                  <tr key={r.locus} className={r.match ? "" : "bg-red-50/50"}>
                    <td className="py-2 pr-3 font-mono text-xs font-medium">{r.locus}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">{r.allele_a1} / {r.allele_a2}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">{r.allele_b1} / {r.allele_b2}</td>
                    <td className="py-2">
                      {r.match
                        ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-3">
          <Label>Analyst Notes</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Interpretation and observations..." />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
