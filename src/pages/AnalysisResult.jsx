// src/pages/AnalysisResult.jsx
import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { ImageComp } from "@/api/entities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

function ScoreGauge({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 60 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444"
  const label = pct >= 60 ? "High similarity" : pct >= 40 ? "Moderate similarity" : "Low similarity"
  const Icon = pct >= 60 ? CheckCircle : pct >= 40 ? AlertCircle : XCircle

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - score)}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums">{pct}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2" style={{ color }}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  )
}

export default function AnalysisResult() {
  const [params] = useSearchParams()
  const id = params.get("id")
  const [comp, setComp]   = useState(null)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!id) return
    ImageComp.get(id).then(c => {
      setComp(c)
      setNotes(c.investigator_notes || "")
    }).finally(() => setLoading(false))
  }, [id])

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await ImageComp.update(id, { investigator_notes: notes, status: "reviewed" })
      toast({ title: "Notes saved" })
      setComp(c => ({ ...c, status: "reviewed" }))
    } catch {
      toast({ title: "Error saving notes", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
  if (!comp) return <div className="text-center py-20 text-muted-foreground">Result not found.</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link to={createPageUrl("AnalysisHistory")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> History
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Analysis Result</h1>
        <p className="text-muted-foreground text-sm mt-1">{new Date(comp.created_date).toLocaleString("pt-BR")}</p>
      </div>

      <Card>
        <CardContent className="pt-2">
          <ScoreGauge score={comp.similarity_score ?? 0} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {[comp.image_a_url, comp.image_b_url].map((url, i) => (
          <div key={i} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{i === 0 ? "Reference Photo" : "Comparison Photo"}</Label>
            <div className="rounded-xl overflow-hidden border aspect-square bg-muted">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5 space-y-3">
          <Label>Investigator Notes</Label>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Record your interpretation of this result..."
            rows={4}
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveNotes} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
