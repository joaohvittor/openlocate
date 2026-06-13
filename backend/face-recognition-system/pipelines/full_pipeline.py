import cv2
import uuid
import logging
import time
from pathlib import Path

from pipelines.detect_faces import detect_faces
from pipelines.align_faces import align_face
from pipelines.preprocess import preprocess
from pipelines.generate_embeddings import generate_embedding
from pipelines.compare_faces import compare_embeddings
from utils.data_manager import save_embedding

logger = logging.getLogger(__name__)

# Thresholds calibrados para ArcFace/InsightFace
DETECTION_SCORE_MIN = 0.6   # confiança mínima do detector
MATCH_THRESHOLD     = 0.45  # cosine similarity: acima = match
SAVE_ON_MATCH_ONLY  = True  # só persiste embeddings se for match confirmado


def load_image(path: str):
    """Carrega imagem com validação explícita."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Imagem não encontrada: {path}")
    img = cv2.imread(str(p))
    if img is None:
        raise ValueError(f"cv2 não conseguiu decodificar: {path}")
    return img


def best_face(faces, min_score: float = DETECTION_SCORE_MIN):
    """Retorna a face com maior det_score, acima do mínimo."""
    valid = [f for f in faces if f.det_score >= min_score]
    if not valid:
        return None
    return max(valid, key=lambda f: f.det_score)


def run_pipeline(img1_path: str, img2_path: str) -> dict:
    timings = {}
    start_total = time.perf_counter()

    # --- carregamento ---
    try:
        img1 = load_image(img1_path)
        img2 = load_image(img2_path)
    except (FileNotFoundError, ValueError) as e:
        logger.warning("Erro ao carregar imagem: %s", e)
        return {"error": str(e)}

    # --- pré-processamento ---
    t0 = time.perf_counter()
    img1 = preprocess(img1)
    img2 = preprocess(img2)
    timings["preprocess_ms"] = round((time.perf_counter() - t0) * 1000, 1)

    # --- detecção ---
    t0 = time.perf_counter()
    faces1 = detect_faces(img1)
    faces2 = detect_faces(img2)
    timings["detection_ms"] = round((time.perf_counter() - t0) * 1000, 1)

    face1 = best_face(faces1)
    face2 = best_face(faces2)

    if face1 is None:
        return {"error": "Face não detectada ou com baixa confiança na imagem 1"}
    if face2 is None:
        return {"error": "Face não detectada ou com baixa confiança na imagem 2"}

    logger.info("Det scores: img1=%.3f  img2=%.3f", face1.det_score, face2.det_score)

    # --- alinhamento ---
    aligned1 = align_face(img1, face1)
    aligned2 = align_face(img2, face2)

    # --- embeddings ---
    t0 = time.perf_counter()
    emb1 = generate_embedding(aligned1)
    emb2 = generate_embedding(aligned2)
    timings["embedding_ms"] = round((time.perf_counter() - t0) * 1000, 1)

    if emb1 is None or emb2 is None:
        logger.error("Falha ao gerar embedding")
        return {"error": "Embedding falhou"}

    # --- comparação ---
    score = float(compare_embeddings(emb1, emb2))
    is_match = score >= MATCH_THRESHOLD

    logger.info("Score: %.4f | Match: %s", score, is_match)

    # --- persistência seletiva ---
    embedding_ids = None
    if not SAVE_ON_MATCH_ONLY or is_match:
        id1, id2 = str(uuid.uuid4()), str(uuid.uuid4())
        save_embedding(id1, emb1, metadata={"source": img1_path, "det_score": face1.det_score})
        save_embedding(id2, emb2, metadata={"source": img2_path, "det_score": face2.det_score})
        embedding_ids = [id1, id2]

    timings["total_ms"] = round((time.perf_counter() - start_total) * 1000, 1)

    return {
        "match": is_match,
        "similarity_score": score,
        "threshold_used": MATCH_THRESHOLD,
        "detection_scores": {
            "img1": round(float(face1.det_score), 4),
            "img2": round(float(face2.det_score), 4),
        },
        "embedding_ids": embedding_ids,
        "timings_ms": timings,
    }