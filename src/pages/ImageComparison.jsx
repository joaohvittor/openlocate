// src/pages/ImageComparison.jsx
import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { createPageUrl } from "@/utils"
import { ImageComp, Case, AuditLog } from "@/api/entities"
import { pythonApi } from "@/api/pythonClient"
import { useAuth } from "@/lib/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, ScanSearch, X, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

function ImageDropzone({ label, file, onFile, disabled }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith("image/")) onFile(f)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {file ? (
        <div className="relative rounded-xl overflow-hidden border aspect-square bg-muted">
          <img src={URL.createObjectURL(file)} alt={label} className="w-full h-full object-cover" />
          {!disabled && (
            <button
              onClick={() => onFile(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-${label}`).click()}
          className={`
            aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3
            cursor-pointer transition-colors
            ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}
            ${disabled ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Drop image here</p>
            <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
          </div>
          <input
            id={`file-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

export default function ImageComparison() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const preselectedCaseId = searchParams.get("case_id") || ""

  const [file1, setFile1]     = useState(null)
  const [file2, setFile2]     = useState(null)
  const [caseId, setCaseId]   = useState(preselectedCaseId)
  const [cases, setCases]     = useState([])
  const [running, setRunning] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    Case.list("-created_date").then(setCases)
  }, [])

  const handleRun = async () => {
    if (!file1 || !file2) return
    setRunning(true)
    setError(null)

    try {
      // Chama o backend Python
      const result = await pythonApi.compareFaces(file1, file2)

      // Salva no base44
      const record = await ImageComp.create({
        case_id: caseId || null,
        image_a_url: URL.createObjectURL(file1), // placeholder — idealmente upload para storage
        image_b_url: URL.createObjectURL(file2),
        similarity_score: result.similarity_score,
        confidence_level: result.similarity_score >= 0.6 ? "high" : result.similarity_score >= 0.4 ? "medium" : "low",
        investigator_name: user?.full_name || user?.email,
        status: "completed",
      })

      // Atualiza contador do caso
      if (caseId) {
        const c = cases.find(c => c.id === caseId)
        if (c) await Case.update(caseId, { comparison_count: (c.comparison_count || 0) + 1 })
      }

      // Log de auditoria
      await AuditLog.create({
        action: "image_comparison",
        entity_type: "ImageComparison",
        entity_id: record.id,
        case_id: caseId || null,
        user_email: user?.email,
        user_name: user?.full_name || user?.email,
        details: `Score: ${(result.similarity_score * 100).toFixed(1)}%`,
      })

      navigate(createPageUrl("AnalysisResult") + `?id=${record.id}`)
    } catch (e) {
      setError(e.message || "Analysis failed. Make sure the Python backend is running.")
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Image Comparison</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload two photos to compare facial similarity using AI.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Photos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <ImageDropzone label="Reference Photo" file={file1} onFile={setFile1} disabled={running} />
          <ImageDropzone label="Comparison Photo" file={file2} onFile={setFile2} disabled={running} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Link to Case <span className="text-muted-foreground">(optional)</span></Label>
            <Select value={caseId} onValueChange={setCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No case</SelectItem>
                {cases.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleRun}
            disabled={!file1 || !file2 || running}
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ScanSearch className="w-4 h-4" />
                Run Comparison
              </>
            )}
          </Button>

          {(!file1 || !file2) && (
            <p className="text-xs text-center text-muted-foreground">Upload both photos to run the analysis.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
