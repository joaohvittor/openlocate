import numpy as np
from numpy.linalg import norm
import logging

logger = logging.getLogger(__name__)

THRESHOLD_HIGH   = 0.6
THRESHOLD_MEDIUM = 0.4


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """
    Similaridade cosseno entre dois vetores normalizados.
    Resultado entre -1 e 1 — quanto mais próximo de 1, mais similar.
    Como os embeddings do InsightFace já vêm normalizados (norma L2 = 1),
    isso equivale a produto interno simples (mais rápido).
    """
    norm_a = norm(a)
    norm_b = norm(b)

    if norm_a == 0 or norm_b == 0:
        logger.warning("Embedding com norma zero — retornando similaridade 0.0")
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))


def confidence_level(score: float) -> str:
    if score >= THRESHOLD_HIGH:
        return "high"
    elif score >= THRESHOLD_MEDIUM:
        return "medium"
    else:
        return "low"


def compare_embeddings(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """
    Retorna apenas o score float (0.0 – 1.0).
    Usado pelo full_pipeline e recognize para decisão de match.
    """
    return cosine_similarity(emb1, emb2)


def compare_embeddings_detailed(emb1: np.ndarray, emb2: np.ndarray) -> dict:
    """
    Versão detalhada para endpoints de auditoria ou debug.
    Retorna score + nível de confiança + normas dos vetores.
    """
    score = cosine_similarity(emb1, emb2)

    return {
        "similarity_score": round(score, 4),
        "confidence_level": confidence_level(score),
        "norms": {
            "emb1": round(float(norm(emb1)), 4),
            "emb2": round(float(norm(emb2)), 4),
        }
    }