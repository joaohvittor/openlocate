// src/pages/DNASampleInput.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { DNASample, Case } from "@/api/entities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, FlaskConical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const LOCI = ["D3S1358","vWA","D16S539","CSF1PO","TPOX","TH01","D13S317","D7S820","D8S1179","D21S11","D18S51","D5S818","FGA"]

export default function DNASampleInput() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [cases, setCases]   = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    case_id: "", sample_label: "", sample_type: "unknown",
    collection_date: "", lab_reference_id: "", collected_by: "", notes: "",
  })
  const [markers, setMarkers] = useState(
    LOCI.map(locus => ({ locus, allele_1: "", allele_2: "" }))
  )

  useEffect(() => { Case.list("-created_date").then(setCases) }, [])

  const setMarker = (i, field, val) => {
    setMarkers(m => m.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  }

  const handleSave = async () => {
    if (!form.sample_label.trim() || !form.sample_type) return
    setSaving(true)
    try {
      const filledMarkers = markers.filter(m => m.allele_1 || m.allele_2)
      await DNASample.create({ ...form, str_markers: filledMarkers, status: "ready" })
      toast({ title: "Sample saved" })
      navigate(createPageUrl("DNAComparison"))
    } catch {
      toast({ title: "Error saving sample", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DNA Sample Input</h1>
        <p className="text-muted-foreground text-sm mt-1">Enter STR marker data for a new DNA sample.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Sample Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sample Label <span className="text-destructive">*</span></Label>
              <Input value={form.sample_label} onChange={e => setForm(f => ({ ...f, sample_label: e.target.value }))} placeholder="e.g. SAMPLE-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Sample Type <span className="text-destructive">*</span></Label>
              <Select value={form.sample_type} onValueChange={v => setForm(f => ({ ...f, sample_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="victim">Victim</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                  <SelectItem value="reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Collection Date</Label>
              <Input type="date" value={form.collection_date} onChange={e => setForm(f => ({ ...f, collection_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Lab Reference ID</Label>
              <Input value={form.lab_reference_id} onChange={e => setForm(f => ({ ...f, lab_reference_id: e.target.value }))} placeholder="External lab ID" />
            </div>
            <div className="space-y-1.5">
              <Label>Collected By</Label>
              <Input value={form.collected_by} onChange={e => setForm(f => ({ ...f, collected_by: e.target.value }))} placeholder="Institution or person" />
            </div>
            <div className="space-y-1.5">
              <Label>Linked Case</Label>
              <Select value={form.case_id} onValueChange={v => setForm(f => ({ ...f, case_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional notes..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">STR Markers</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Locus</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Allele 1</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Allele 2</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {markers.map((m, i) => (
                  <tr key={m.locus}>
                    <td className="py-2 pr-4 font-mono text-xs font-medium">{m.locus}</td>
                    <td className="py-2 pr-4">
                      <Input value={m.allele_1} onChange={e => setMarker(i, "allele_1", e.target.value)} className="h-7 text-xs w-24" placeholder="—" />
                    </td>
                    <td className="py-2">
                      <Input value={m.allele_2} onChange={e => setMarker(i, "allele_2", e.target.value)} className="h-7 text-xs w-24" placeholder="—" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !form.sample_label.trim()} size="lg" className="gap-2">
          <FlaskConical className="w-4 h-4" />
          {saving ? "Saving..." : "Save Sample"}
        </Button>
      </div>
    </div>
  )
}
