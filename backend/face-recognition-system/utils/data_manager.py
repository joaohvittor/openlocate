import os
import json
import numpy as np
from datetime import datetime

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


def case_path(case_id):
    path = os.path.join(BASE_PATH, "cases", case_id)
    return ensure_dir(path)


# 💾 SALVAR EMBEDDING
def save_embedding(name, embedding):
    path = embedding_path(name)
    ensure_dir(os.path.dirname(path))
    np.save(path, embedding)


def load_embedding(name):
    path = embedding_path(name)

    if not os.path.exists(path):
        return None

    return np.load(path)


# 📂 CASOS
def create_case(case_id):
    base = case_path(case_id)

    ensure_dir(os.path.join(base, "reference"))
    ensure_dir(os.path.join(base, "target"))

    return base


def save_case_result(case_id, result):
    path = os.path.join(case_path(case_id), "result.json")

    result["timestamp"] = datetime.utcnow().isoformat()

    with open(path, "w") as f:
        json.dump(result, f, indent=4)