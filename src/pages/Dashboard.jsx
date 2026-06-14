// src/pages/Dashboard.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { Case, ImageComp, DNAComp } from "@/api/entities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderOpen, ScanSearch, Dna, AlertTriangle, TrendingUp, Clock, Plus } from "lucide-react"

const priorityColor = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

const statusColor = {
  open: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  reviewing: "bg-amber-500/10 text-amber-600 border-amber-200",
  closed: "bg-slate-500/10 text-slate-500 border-slate-200",
}

export default function Dashboard() {
  const [cases, setCases] = useState([])
  const [comparisons, setComparisons] = useState([])
  const [dnaComps, setDnaComps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      Case.list("-created_date", 10),
      ImageComp.list("-created_date", 5),
      DNAComp.list("-created_date", 5),
    ]).then(([c, ic, dc]) => {
      setCases(c)
      setComparisons(ic)
      setDnaComps(dc)
    }).finally(() => setLoading(false))
  }, [])

  const openCases    = cases.filter(c => c.status === "open").length
  const criticalCases = cases.filter(c => c.priority === "critical").length
  const totalComps   = comparisons.length + dnaComps.length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Active investigations and recent activity</p>
        </div>
        <Link to={createPageUrl("Cases")}>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Case
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Cases",       value: openCases,     icon: FolderOpen,  color: "text-emerald-600" },
          { label: "Critical Priority", value: criticalCases, icon: AlertTriangle, color: "text-red-500" },
          { label: "Total Cases",      value: cases.length,  icon: TrendingUp,  color: "text-blue-500" },
          { label: "Analyses Run",     value: totalComps,    icon: ScanSearch,  color: "text-violet-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Cases */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Cases</CardTitle>
            <Link to={createPageUrl("Cases")} className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {cases.slice(0, 5).map(c => (
              <Link key={c.id} to={createPageUrl("CaseDetail") + `?id=${c.id}`}>
                <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.created_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center shrink-0 ml-3">
                    <Badge variant={priorityColor[c.priority]} className="text-[10px]">{c.priority}</Badge>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {cases.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No cases yet — create one to get started.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Analyses</CardTitle>
            <Link to={createPageUrl("AnalysisHistory")} className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {comparisons.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <ScanSearch className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Image Comparison</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                {c.similarity_score != null && (
                  <span className="text-sm font-bold tabular-nums">
                    {(c.similarity_score * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
            {dnaComps.slice(0, 2).map(d => (
              <div key={d.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Dna className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">DNA Comparison</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.created_date).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                {d.similarity_ratio != null && (
                  <span className="text-sm font-bold tabular-nums">{d.similarity_ratio.toFixed(1)}%</span>
                )}
              </div>
            ))}
            {comparisons.length === 0 && dnaComps.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No analyses yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
