// src/pages/DNAHistory.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { DNAComparison as DNAComp } from "@/api/entities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dna } from "lucide-react"

const levelColor = {
  "high correspondence":     "text-emerald-600",
  "moderate correspondence": "text-amber-600",
  "low correspondence":      "text-red-500",
}

const statusVariant = { completed: "secondary", reviewed: "default", flagged: "destructive" }

export default function DNAHistory() {
  const [comps, setComps]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    DNAComp.list("-created_date").then(setComps).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DNA History</h1>
        <p className="text-muted-foreground text-sm mt-1">{comps.length} comparisons performed</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : comps.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Dna className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No DNA comparisons yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comps.map(c => (
            <Link key={c.id} to={createPageUrl("DNAResult") + `?id=${c.id}`}>
              <Card className="hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Dna className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {c.sample_a_label} <span className="text-muted-foreground">vs</span> {c.sample_b_label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(c.created_date).toLocaleString("pt-BR")} · {c.loci_compared} loci
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold tabular-nums ${levelColor[c.correspondence_level] || ""}`}>
                      {c.similarity_ratio?.toFixed(1)}%
                    </span>
                    <Badge variant={statusVariant[c.status] || "outline"} className="text-[10px]">{c.status}</Badge>
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
