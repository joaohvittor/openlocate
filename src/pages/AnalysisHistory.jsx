// src/pages/AnalysisHistory.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { ImageComp } from "@/api/entities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScanSearch, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const statusColor = {
  pending:   "outline",
  completed: "secondary",
  reviewed:  "default",
  flagged:   "destructive",
}

function ScoreBadge({ score }) {
  if (score == null) return null
  const pct = Math.round(score * 100)
  const color = pct >= 60 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-500"
  const Icon  = pct >= 60 ? CheckCircle : pct >= 40 ? AlertCircle : XCircle
  return (
    <div className={`flex items-center gap-1.5 font-bold tabular-nums ${color}`}>
      <Icon className="w-4 h-4" />
      {pct}%
    </div>
  )
}

export default function AnalysisHistory() {
  const [comps, setComps]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [filter, setFilter]   = useState("all")

  useEffect(() => {
    ImageComp.list("-created_date").then(setComps).finally(() => setLoading(false))
  }, [])

  const filtered = comps.filter(c => {
    const matchFilter = filter === "all" || c.status === filter
    const matchSearch = !search || c.investigator_name?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analysis History</h1>
        <p className="text-muted-foreground text-sm mt-1">{comps.length} image comparisons total</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by investigator..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ScanSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No analyses found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link key={c.id} to={createPageUrl("AnalysisResult") + `?id=${c.id}`}>
              <Card className="hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ScanSearch className="w-4 h-4 text-violet-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Image Comparison</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(c.created_date).toLocaleString("pt-BR")}
                        {c.investigator_name && ` · ${c.investigator_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={c.similarity_score} />
                    <Badge variant={statusColor[c.status]} className="text-[10px]">{c.status}</Badge>
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
