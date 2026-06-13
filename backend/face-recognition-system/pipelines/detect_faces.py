import cv2
import numpy as np
import logging
import threading
import yaml
from pathlib import Path
from insightface.app import FaceAnalysis

logger = logging.getLogger(__name__)

# Thread-safe singleton
_app = None
_lock = threading.Lock()

# Tamanhos de detecção — testa do maior para o menor
# Maior = encontra faces pequenas e distantes, mas mais lento
# Menor = mais rápido, só faces próximas/grandes
_DET_SIZES = [(640, 640), (320, 320)]

def _load_ctx_id() -> int:
    """Lê gpu_id do config.yaml; fallback para CPU se não encontrar."""
    try:
        config_path = Path(__file__).parent.parent / "config.yaml"
        with open(config_path) as f:
            config = yaml.safe_load(f)
        return config.get("gpu_id", -1)
    except Exception:
        return -1  # CPU como fallback seguro


def _get_app() -> FaceAnalysis:
    """
    Lazy init thread-safe.
    Usa lock para evitar inicialização dupla em ambientes com múltiplas threads (FastAPI).
    """
    global _app
    if _app is None:
        with _lock:
            if _app is None:  # double-check dentro do lock
                ctx_id = _load_ctx_id()
                _app = FaceAnalysis(
                    name="buffalo_l",
                    allowed_modules=["detection"]
                )
                # det_size maior = detecta faces menores e em grupo
                # crítico para fotos de multidão ou imagens de câmera de segurança
                _app.prepare(ctx_id=ctx_id, det_size=_DET_SIZES[0])
                logger.info(
                    "FaceAnalysis carregado | modelo=buffalo_l | ctx_id=%d | det_size=%s",
                    ctx_id, _DET_SIZES[0]
                )
    return _app


def _preprocess_for_detection(img: np.ndarray) -> np.ndarray:
    """
    Prepara a imagem para maximizar a taxa de detecção:
    - Redimensiona imagens muito grandes (câmeras de alta resolução)
    - Garante 3 canais (descarta alpha se existir)
    - Mantém proporção original
    """
    if img.ndim == 2:
        # Grayscale → BGR
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        # BGRA → BGR (remove canal alpha)
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

    h, w = img.shape[:2]
    max_side = 1920  # acima disso o modelo não ganha precisão, só fica lento

    if max(h, w) > max_side:
        scale = max_side / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        logger.debug("Imagem redimensionada: (%d,%d) → (%d,%d)", w, h, img.shape[1], img.shape[0])

    return img


def _multiscale_detect(img: np.ndarray, min_score: float) -> list:
    """
    Tenta detectar faces em múltiplas escalas.
    Útil para fotos onde a face é muito pequena (câmera de segurança, foto de grupo).
    Se o modelo padrão (640x640) não encontrar nada, tenta ampliar a região.
    """
    app = _get_app()

    faces = app.get(img)
    valid = [f for f in faces if f.det_score >= min_score]

    if valid:
        return valid

    # Fallback: upscale 2x para tentar detectar faces pequenas
    logger.debug("Nenhuma face encontrada — tentando upscale 2x")
    h, w = img.shape[:2]
    upscaled = cv2.resize(img, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
    faces_up = app.get(upscaled)
    valid_up = [f for f in faces_up if f.det_score >= min_score]

    if valid_up:
        # Ajusta coordenadas bbox e landmarks de volta para escala original
        for face in valid_up:
            face.bbox /= 2.0
            if face.kps is not None:
                face.kps /= 2.0
        logger.debug("Faces encontradas após upscale: %d", len(valid_up))
        return valid_up

    return []


def detect_faces(img: np.ndarray, min_score: float = 0.6) -> list:
    """
    Detecta faces em uma imagem com máxima robustez.

    Estratégia:
      1. Pré-processa (normaliza canais, redimensiona se necessário)
      2. Detecta com RetinaFace (buffalo_l) em 640x640
      3. Se não encontrar, tenta upscale 2x (faces pequenas/distantes)

    Args:
        img:       imagem BGR (cv2.imread ou preprocess)
        min_score: confiança mínima (0.0–1.0). 0.6 = bom balanço precisão/recall.
                   Reduza para 0.4 se estiver perdendo faces válidas.

    Returns:
        Lista de Face ordenada por det_score decrescente.
        Lista vazia se nenhuma face válida for encontrada.
    """
    if img is None or not isinstance(img, np.ndarray) or img.size == 0:
        logger.warning("detect_faces: imagem inválida ou vazia")
        return []

    try:
        img = _preprocess_for_detection(img)
        faces = _multiscale_detect(img, min_score)
    except Exception as e:
        logger.error("Erro inesperado na detecção: %s", e, exc_info=True)
        return []

    # Ordena por confiança decrescente — a melhor face primeiro
    faces.sort(key=lambda f: f.det_score, reverse=True)

    logger.debug(
        "Resultado final: %d face(s) | scores: %s",
        len(faces),
        [round(float(f.det_score), 3) for f in faces]
    )

    return faces