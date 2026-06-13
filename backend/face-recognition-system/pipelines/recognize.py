import numpy as np
import logging
from pathlib import Path

from pipelines.detect_faces import detect_faces
from pipelines.align_faces import align_face
from pipelines.generate_embeddings import generate_embedding
from pipelines.compare_faces import compare_embeddings
from pipelines.build_index import load_index, search_index
from utils.data_manager import load_embedding_metadata

logger = logging.getLogger(__name__)

MATCH_THRESHOLD = 0.45  # cosine similarity mínima para considerar match


# ─────────────────────────────────────────────
# MODO 1:1 — duas fotos, mesma pessoa?
# ─────────────────────────────────────────────

def recognize_pair(img1: np.ndarray, img2: np.ndarray) -> dict:
    """
    Compara duas imagens e retorna se são a mesma pessoa.
    Usado para validar um suspeito de match manualmente.
    """
    emb1 = _extract_embedding(img1, label="img1")
    emb2 = _extract_embedding(img2, label="img2")

    if emb1 is None or emb2 is None:
        return {"error": "Não foi possível extrair embedding de uma ou ambas as imagens"}

    score = float(compare_embeddings(emb1, emb2))
    is_match = score >= MATCH_THRESHOLD

    return {
        "mode": "1:1",
        "match": is_match,
        "similarity_score": round(score, 4),
        "threshold_used": MATCH_THRESHOLD,
    }


# ─────────────────────────────────────────────
# MODO 1:N — busca no banco de embeddings
# ─────────────────────────────────────────────

def recognize_from_database(img: np.ndarray, top_k: int = 5) -> dict:
    """
    Recebe uma foto e busca os top_k candidatos mais similares no banco.
    Retorna lista rankeada com scores e metadados de cada candidato.
    """
    emb = _extract_embedding(img, label="query")
    if emb is None:
        return {"error": "Não foi possível extrair embedding da imagem"}

    index, id_map = load_index()
    if index is None:
        return {"error": "Índice FAISS não encontrado — execute build_index.py primeiro"}

    results = search_index(index, id_map, emb, top_k=top_k)

    if not results:
        return {
            "mode": "1:N",
            "match_found": False,
            "candidates": []
        }

    # Enriquece com metadados salvos (nome, caso, fonte da foto, etc.)
    candidates = []
    for r in results:
        meta = load_embedding_metadata(r["id"]) or {}
        candidates.append({
            "id": r["id"],
            "similarity_score": round(r["score"], 4),
            "is_match": r["score"] >= MATCH_THRESHOLD,
            "metadata": meta
        })

    best = candidates[0]

    return {
        "mode": "1:N",
        "match_found": best["is_match"],
        "best_match": best if best["is_match"] else None,
        "candidates": candidates,
        "threshold_used": MATCH_THRESHOLD,
    }


# ─────────────────────────────────────────────
# HELPER interno
# ─────────────────────────────────────────────

def _extract_embedding(img: np.ndarray, label: str = "img") -> np.ndarray | None:
    """Detecta, alinha e gera embedding de uma imagem."""
    faces = detect_faces(img)
    if not faces:
        logger.warning("[%s] Nenhuma face detectada", label)
        return None

    face = max(faces, key=lambda f: f.det_score)
    aligned = align_face(img, face)
    if aligned is None:
        logger.warning("[%s] Alinhamento falhou", label)
        return None

    emb = generate_embedding(aligned)
    if emb is None:
        logger.warning("[%s] Embedding falhou", label)
        return None

    return emb