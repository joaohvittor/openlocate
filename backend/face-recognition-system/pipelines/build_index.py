import faiss
import numpy as np
import logging
import pickle
from pathlib import Path
from utils.data_manager import BASE_PATH, load_embedding

logger = logging.getLogger(__name__)

INDEX_PATH = Path(BASE_PATH) / "index" / "faiss.index"
ID_MAP_PATH = Path(BASE_PATH) / "index" / "id_map.pkl"
EMBEDDING_DIM = 512  # ArcFace/buffalo_l


def build_index() -> int:
    emb_dir = Path(BASE_PATH) / "embeddings"
    npy_files = list(emb_dir.glob("*.npy"))

    if not npy_files:
        logger.warning("Nenhum embedding encontrado em %s", emb_dir)
        return 0

    embeddings = []
    id_map = []

    for npy_file in npy_files:
        name = npy_file.stem
        emb = load_embedding(name)
        if emb is None or emb.shape != (EMBEDDING_DIM,):
            logger.warning("Embedding inválido ignorado: %s", name)
            continue
        embeddings.append(emb)
        id_map.append(name)

    if not embeddings:
        logger.error("Nenhum embedding válido para indexar")
        return 0

    matrix = np.array(embeddings, dtype=np.float32)

    index = faiss.IndexFlatIP(EMBEDDING_DIM)
    index.add(matrix)

    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(INDEX_PATH))
    with open(ID_MAP_PATH, "wb") as f:
        pickle.dump(id_map, f)

    logger.info("Índice construído: %d embeddings", index.ntotal)
    return index.ntotal


def load_index():
    if not INDEX_PATH.exists() or not ID_MAP_PATH.exists():
        logger.warning("Índice não encontrado em %s", INDEX_PATH.parent)
        return None, None

    index = faiss.read_index(str(INDEX_PATH))
    with open(ID_MAP_PATH, "rb") as f:
        id_map = pickle.load(f)

    logger.debug("Índice carregado: %d embeddings", index.ntotal)
    return index, id_map


def search_index(index, id_map: list, query_emb: np.ndarray, top_k: int = 5) -> list[dict]:
    query = query_emb.reshape(1, -1).astype(np.float32)
    k = min(top_k, index.ntotal)

    scores, indices = index.search(query, k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        results.append({
            "id": id_map[idx],
            "score": float(score)
        })

    return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    total = build_index()
    print(f"Índice construído com {total} embeddings")