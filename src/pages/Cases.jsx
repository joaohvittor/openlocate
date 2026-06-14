// src/pages/Cases.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { Case } from "@/api/entities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, FolderOpen, Calendar, ScanSearch } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const priorityColor = { critical: "destructive", high: "destructive", medium: "secondary", low: "outline" }
const statusColor = {
  open:      "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  reviewing: "bg-amber-500/10 text-amber-600 border-amber-200",
  closed:    "bg-slate-500/10 text-slate-500 border-slate-200",
}

export default function Cases() {
  const [cases, setCases]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [open, setOpen]           = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ title: "", description: "", priority: "medium", status: "open" })
  const { toast } = useToast()

  const load = () => {
    setLoading(true)
    Case.list("-created_date").then(setCases).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = cases.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await Case.create(form)
      toast({ title: "Case created", description: form.title })
      setOpen(false)
      setForm({ title: "", description: "", priority: "medium", status: "open" })
      load()
    } catch {
      toast({ title: "Error creating case", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground text-sm mt-1">{cases.length} total · {cases.filter(c => c.status === "open").length} open</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Case</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Case title" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details about the case..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving || !form.title.trim()}>
                  {saving ? "Creating..." : "Create Case"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{search ? "No cases match your search." : "No cases yet."}</p>
          {!search && <p className="text-sm mt-1">Create the first case to get started.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link key={c.id} to={createPageUrl("CaseDetail") + `?id=${c.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/30">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{c.title}</p>
                        <Badge variant={priorityColor[c.priority]} className="text-[10px] shrink-0">{c.priority}</Badge>
                      </div>
                      {c.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{c.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.created_date).toLocaleDateString("pt-BR")}
                        </span>
                        {c.comparison_count > 0 && (
                          <span className="flex items-center gap-1">
                            <ScanSearch className="w-3 h-3" />
                            {c.comparison_count} comparison{c.comparison_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${statusColor[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
