import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon, Trash2 } from "lucide-react";

export default function CaseImages({ caseData }) {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Case.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case", caseData.id] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const images = [...(caseData.images || []), file_url];
    updateMutation.mutate({ id: caseData.id, data: { images } });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemove = (idx) => {
    const images = (caseData.images || []).filter((_, i) => i !== idx);
    updateMutation.mutate({ id: caseData.id, data: { images } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Case Images
        </h3>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
          Upload
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {(caseData.images?.length || 0) === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No images attached</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {caseData.images.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => handleRemove(idx)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}