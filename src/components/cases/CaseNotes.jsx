import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageSquare } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

export default function CaseNotes({ caseId }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("general");

  const { data: notes = [] } = useQuery({
    queryKey: ["case-notes", caseId],
    queryFn: () => base44.entities.CaseNote.filter({ case_id: caseId }, "-created_date"),
    enabled: !!caseId,
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.CaseNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-notes", caseId] });
      setContent("");
      setNoteType("general");
    },
  });

  const handleAdd = () => {
    if (!content.trim()) return;
    addNoteMutation.mutate({ case_id: caseId, content, note_type: noteType });
  };

  const typeColors = {
    general: "bg-muted text-muted-foreground",
    update: "bg-primary/10 text-primary",
    finding: "bg-success/10 text-success",
    action: "bg-warning/10 text-warning",
  };

  return (
    <div>
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4" /> Case Notes
      </h3>
      
      <div className="space-y-3 mb-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          className="h-20"
        />
        <div className="flex items-center gap-3">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="finding">Finding</SelectItem>
              <SelectItem value="action">Action</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={addNoteMutation.isPending || !content.trim()}>
            {addNoteMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            Add Note
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="border rounded-lg p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${typeColors[note.note_type] || typeColors.general}`}>
                {note.note_type}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {note.created_by} · {note.created_date ? format(new Date(note.created_date), "MMM d, yyyy h:mm a") : ""}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
        )}
      </div>
    </div>
  );
}