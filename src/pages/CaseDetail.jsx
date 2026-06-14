// src/pages/CaseDetail.jsx
import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { Case, ImageComp, CaseNote, AuditLog } from "@/api/entities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScanSearch, FileText, Clock, Plus, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const statusColor = {
  open:      "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  reviewing: "bg-amber-500/10 text-amber-600 border-amber-200",
  closed:    "bg-slate-500/10 text-slate-500 border-slate-200",
}

const noteTypeColor = { general: "secondary", update: "outline", finding: "default", action: "destructive" }

export default function CaseDetail() {
  const [params] = useSearchParams()
  const id = params.get("id")
  const [caseData, setCaseData]   = useState(null)
  const [comps, setComps]         = useState([])
  const [notes, setNotes]         = useState([])
  const [newNote, setNewNote]     = useState("")
  const [noteType, setNoteType]   = useState("general")
  const [savingNote, setSavingNote] = useState(false)
  const [loading, setLoading]     = useState(true)
  const { toast } = useToast()

  const load = () => {
    if (!id) return
    Promise.all([
      Case.get(id),
      ImageComp.filter({ case_id: id }),
      CaseNote.filter({ case_id: id }),
    ]).then(([c, ic, cn]) => {
      setCaseData(c)
      setComps(ic)
      setNotes(cn.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (status) => {
    await Case.update(id, { status })
    setCaseData(d => ({ ...d, status }))
    toast({ title: "Status updated" })
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setSavingNote(true)
    try {
      await CaseNote.create({ case_id: id, content: newNote, note_type: noteType })
      setNewNote("")
      load()
    } catch {
      toast({ title: "Error saving note", variant: "destructive" })
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!caseData) return (
    <div className="text-center py-20 text-muted-foreground">Case not found.</div>
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Back + header */}
      <div>
        <Link to={createPageUrl("Cases")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Cases
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
            {caseData.description && (
              <p className="text-muted-foreground mt-1 text-sm">{caseData.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={caseData.priority === "critical" || caseData.priority === "high" ? "destructive" : "secondary"}>
                {caseData.priority}
              </Badge>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor[caseData.status]}`}>
                {caseData.status}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(caseData.created_date).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select value={caseData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Link to={createPageUrl("ImageComparison") + `?case_id=${id}`}>
              <Button size="sm" className="gap-1.5 h-8 text-xs">
                <ScanSearch className="w-3.5 h-3.5" /> New Analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="comparisons">
        <TabsList>
          <TabsTrigger value="comparisons">Image Analyses ({comps.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
        </TabsList>

        {/* Comparisons */}
        <TabsContent value="comparisons" className="mt-4 space-y-3">
          {comps.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <ScanSearch className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No analyses yet for this case.</p>
              <Link to={createPageUrl("ImageComparison") + `?case_id=${id}`}>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Run First Analysis
                </Button>
              </Link>
            </div>
          ) : comps.map(c => (
            <Card key={c.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ScanSearch className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Image Comparison</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.similarity_score != null && (
                    <span className="text-lg font-bold tabular-nums">
                      {(c.similarity_score * 100).toFixed(1)}%
                    </span>
                  )}
                  <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note, finding, or action item..."
                rows={3}
              />
              <div className="flex items-center justify-between">
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="finding">Finding</SelectItem>
                    <SelectItem value="action">Action Item</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleAddNote} disabled={savingNote || !newNote.trim()}>
                  {savingNote ? "Saving..." : "Add Note"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {notes.map(n => (
              <Card key={n.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={noteTypeColor[n.note_type]} className="text-[10px]">{n.note_type}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(n.created_date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
