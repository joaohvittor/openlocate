// src/api/entities.js
// Wrapper sobre base44 SDK para cada entidade do sistema
import { base44 } from './base44Client'

export const Case        = base44.entities.Case
export const ImageComp   = base44.entities.ImageComparison
export const DNASample   = base44.entities.DNASample
export const DNAComp     = base44.entities.DNAComparison
export const CaseNote    = base44.entities.CaseNote
export const AuditLog    = base44.entities.AuditLog
