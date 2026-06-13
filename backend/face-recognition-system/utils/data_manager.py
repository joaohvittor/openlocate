import os
import json
import numpy as np
from datetime import datetime, timezone

BASE_PATH = "data"


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)
    return path


# 📁 PATHS
def raw_path(filename):
    return os.path.join(BASE_PATH, "raw", filename)


def processed_path(filename):
    return os.path.join(BASE_PATH, "processed", filename)


def embedding_path(name):
    return os.path.join(BASE_PATH, "embeddings", f"{name}.npy")


def metadata_path(name):
    return os.path.join(BASE_PATH, "embeddings", f"{name}.json")


def case_path(case_id):
    path = os.path.join(BASE_PATH, "cases", case_id)
    return ensure_dir(path)


# 💾 SALVAR EMBEDDING
def save_embedding(name: str, embedding: np.ndarray, metadata: dict = None):
    """
    Salva embedding (.npy) e metadados opcionais (.json) com o mesmo nome.
    Metadados incluem timestamp automático + qualquer campo extra passado.
    """
    path = embedding_path(name)
    ensure_dir(os.path.dirname(path))
    np.save(path, embedding)

    meta = {
        "id": name,
        "shape": list(embedding.shape),
        "dtype": str(embedding.dtype),
        "saved_at": datetime.now(timezone.utc).isoformat(),
        **(metadata or {})
    }
    with open(metadata_path(name), "w") as f:
        json.dump(meta, f, indent=2)


def load_embedding(name: str) -> np.ndarray | None:
    path = embedding_path(name)
    if not os.path.exists(path):
        return None
    return np.load(path)


def load_embedding_metadata(name: str) -> dict | None:
    path = metadata_path(name)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def delete_embedding(name: str):
    """Remove embedding e metadados. Útil para limpar falsos positivos."""
    for path in [embedding_path(name), metadata_path(name)]:
        if os.path.exists(path):
            os.remove(path)


# 📂 CASOS
def create_case(case_id: str) -> str:
    base = case_path(case_id)
    ensure_dir(os.path.join(base, "reference"))
    ensure_dir(os.path.join(base, "target"))
    return base


def save_case_result(case_id: str, result: dict):
    path = os.path.join(case_path(case_id), "result.json")

    result["timestamp"] = datetime.now(timezone.utc).isoformat()  # utcnow() é deprecated no 3.12+

    with open(path, "w") as f:
        json.dump(result, f, indent=4)


def load_case_result(case_id: str) -> dict | None:
    """Carrega resultado de um caso existente. Útil para histórico e auditoria."""
    path = os.path.join(case_path(case_id), "result.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def list_cases() -> list[str]:
    """Retorna todos os case_ids existentes."""
    cases_dir = os.path.join(BASE_PATH, "cases")
    if not os.path.exists(cases_dir):
        return []
    return [d for d in os.listdir(cases_dir)
            if os.path.isdir(os.path.join(cases_dir, d))]