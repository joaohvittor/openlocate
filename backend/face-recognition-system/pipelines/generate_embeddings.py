import numpy as np
import logging
from insightface.app import FaceAnalysis

logger = logging.getLogger(__name__)

_app = None


def _get_app() -> FaceAnalysis:
    """
    Lazy init separado do detect_faces.
    Aqui carregamos só o módulo de recognition (embedding ArcFace).
    """
    global _app
    if _app is None:
        _app = FaceAnalysis(
            name="buffalo_l",
            allowed_modules=["recognition"]
        )
        _app.prepare(ctx_id=0)  # -1 para CPU
        logger.info("Módulo de recognition carregado (buffalo_l)")
    return _app


def generate_embedding(aligned_face: np.ndarray) -> np.ndarray | None:
    """
    Gera embedding de 512 dimensões a partir de uma face alinhada.
    O embedding é normalizado (norma L2 = 1) para que cosine similarity
    seja equivalente a produto interno — mais eficiente no FAISS.

    Args:
        aligned_face: imagem 112x112 BGR, saída do align_face()

    Returns:
        np.ndarray de shape (512,) normalizado, ou None em caso de falha.
    """
    if aligned_face is None:
        logger.warning("generate_embedding recebeu None")
        return None

    if aligned_face.shape[:2] != (112, 112):
        logger.warning(
            "Tamanho inesperado: %s — esperado (112, 112)",
            aligned_face.shape[:2]
        )
        return None

    app = _get_app()

    try:
        # O InsightFace espera receber a imagem completa para detectar+embedar,
        # mas aqui já temos a face alinhada — usamos o modelo diretamente
        faces = app.get(aligned_face)

        if not faces:
            logger.warning("Nenhuma face encontrada na imagem alinhada")
            return None

        embedding = faces[0].normed_embedding  # já normalizado pelo InsightFace

        if embedding is None:
            logger.warning("normed_embedding retornou None")
            return None

        return embedding.astype(np.float32)

    except Exception as e:
        logger.error("Erro ao gerar embedding: %s", e)
        return None


def generate_embedding_direct(aligned_face: np.ndarray) -> np.ndarray | None:
    """
    Versão alternativa: usa o modelo ArcFace diretamente sem re-detectar.
    Mais eficiente quando você já tem certeza que a imagem é uma face alinhada.
    Use esta se o app.get() acima falhar consistentemente em faces já cropadas.
    """
    try:
        app = _get_app()
        # Acessa o modelo de recognition diretamente
        rec_model = app.models.get("recognition")
        if rec_model is None:
            logger.error("Modelo de recognition não encontrado")
            return None

        embedding = rec_model.get_feat(aligned_face)
        # Normaliza manualmente
        norm = np.linalg.norm(embedding)
        if norm == 0:
            return None
        return (embedding / norm).astype(np.float32)

    except Exception as e:
        logger.error("Erro no generate_embedding_direct: %s", e)
        return None