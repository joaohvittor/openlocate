import cv2
import numpy as np
import logging
from insightface.utils import face_align

logger = logging.getLogger(__name__)

# Tamanho padrão esperado pelo ArcFace/buffalo_l
ALIGNED_SIZE = (112, 112)


def align_face(img: np.ndarray, face) -> np.ndarray | None:
    """
    Alinha uma face usando os landmarks detectados pelo InsightFace.
    O alinhamento normaliza posição dos olhos, nariz e boca —
    isso aumenta significativamente a precisão do embedding.

    Args:
        img:  imagem BGR original (antes do crop)
        face: objeto Face retornado por detect_faces()

    Returns:
        Imagem alinhada (112x112 BGR) ou None em caso de falha.
    """
    if img is None or face is None:
        logger.warning("align_face recebeu img ou face None")
        return None

    if not hasattr(face, "kps") or face.kps is None:
        logger.warning("Face sem landmarks (kps) — alinhamento impossível, usando crop simples")
        return _fallback_crop(img, face)

    try:
        aligned = face_align.norm_crop(img, landmark=face.kps, image_size=ALIGNED_SIZE[0])
        return aligned
    except Exception as e:
        logger.error("Erro no alinhamento: %s", e)
        return _fallback_crop(img, face)


def _fallback_crop(img: np.ndarray, face) -> np.ndarray | None:
    """
    Crop simples pela bounding box quando landmarks não estão disponíveis.
    Qualidade inferior ao alinhamento, mas melhor do que falhar.
    """
    try:
        box = face.bbox.astype(int)
        x1, y1, x2, y2 = box[0], box[1], box[2], box[3]

        # Garante que o crop não saia da imagem
        h, w = img.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        crop = img[y1:y2, x1:x2]
        if crop.size == 0:
            return None

        return cv2.resize(crop, ALIGNED_SIZE)
    except Exception as e:
        logger.error("Fallback crop falhou: %s", e)
        return None