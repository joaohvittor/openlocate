// src/pages/DNAComparison.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { DNASample, DNAComparison as DNAComp, AuditLog } from "@/api/entities"
import { useAuth } from "@/lib/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dna, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

function compareSamples(a, b) {
  const markersA = Object.fromEntries((a.str_markers || []).map(m => [m.locus, m]))
  const markersB = Object.fromEntries((b.str_markers || []).map(m => [m.locus, m]))
  const allLoci  = [...new Set([...Object.keys(markersA), ...Object.keys(markersB)])]

  const results = allLoci.map(locus => {
    const ma = markersA[locus]
    const mb = markersB[locus]
    if (!ma || !mb) return { locus, allele_a1: ma?.allele_1, allele_a2: ma?.allele_2, allele_b1: mb?.allele_1, allele_b2: mb?.allele_2, match: false }
    const match =
      (ma.allele_1 === mb.allele_1 && ma.allele_2 === mb.allele_2) ||
      (ma.allele_1 === mb.allele_2 && ma.allele_2 === mb.allele_1)
    return { locus, allele_a1: ma.allele_1, allele_a2: ma.allele_2, allele_b1: mb.allele_1, allele_b2: mb.allele_2, match }
  })

  const matched    = results.filter(r => r.match).length
  const ratio      = allLoci.length > 0 ? (matched / allLoci.length) * 100 : 0
  const level      = ratio >= 75 ? "high correspondence" : ratio >= 40 ? "moderate correspondence" : "low correspondence"

  return { results, loci_compared: allLoci.length, loci_matched: matched, loci_mismatched: allLoci.length - matched, similarity_ratio: ratio, correspondence_level: level }
}

export default function DNAComparison() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [samples, setSamples] = useState([])
  const [sampleA, setSampleA] = useState("")
  const [sampleB, setSampleB] = useState("")
  const [authorized, setAuthorized] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => { DNASample.filter({ status: "ready" }).then(setSamples) }, [])

  const handleCompare = async () => {
    if (!sampleA || !sampleB || !authorized || sampleA === sampleB) return
    setRunning(true)
    try {
      const a = samples.find(s => s.id === sampleA)
      const b = samples.find(s => s.id === sampleB)
      const analysis = compareSamples(a, b)

      const record = await DNAComp.create({
        case_id: a.case_id || b.case_id || null,
        sample_a_id: sampleA, sample_b_id: sampleB,
        sample_a_label: a.sample_label, sample_b_label: b.sample_label,
        ...analysis,
        authorized_by: user?.email,
        status: "completed",
      })

      await AuditLog.create({
        action: "dna_comparison", entity_type: "DNAComparison", entity_id: record.id,
        user_email: user?.email, user_name: user?.full_name || user?.email,
        details: `${analysis.loci_matched}/${analysis.loci_compared} loci matched`,
      })

      navigate(createPageUrl("DNAResult") + `?id=${record.id}`)
    } catch {
      toast({ title: "Error running comparison", variant: "destructive" })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DNA Comparison</h1>
        <p className="text-muted-foreground text-sm mt-1">Compare STR profiles from two samples.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Select Samples</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[["Sample A", sampleA, setSampleA], ["Sample B", sampleB, setSampleB]].map(([label, val, set]) => (
            <div key={label} className="space-y-1.5">
              <Label>{label}</Label>
              <Select value={val} onValueChange={set}>
                <SelectTrigger><SelectValue placeholder="Select a sample..." /></SelectTrigger>
                <SelectContent>
                  {samples.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.sample_label} <span className="text-muted-foreground">({s.sample_type})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Legal Authorization Required</p>
              <p className="text-xs text-amber-700 mt-1">DNA comparison may only be performed with appropriate legal authorization. Results are for investigative purposes only and do not constitute a forensic match determination.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="auth" checked={authorized} onCheckedChange={setAuthorized} />
            <Label htmlFor="auth" className="text-sm cursor-pointer">I confirm legal authorization has been obtained for this comparison.</Label>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full gap-2" size="lg"
        onClick={handleCompare}
        disabled={!sampleA || !sampleB || !authorized || sampleA === sampleB || running}
      >
        {running ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Comparing...</>
        ) : (
          <><Dna className="w-4 h-4" /> Run DNA Comparison</>
        )}
      </Button>
      {sampleA === sampleB && sampleA && <p className="text-xs text-center text-destructive">Select two different samples.</p>}
    </div>
  )
}
