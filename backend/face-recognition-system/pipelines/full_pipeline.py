import cv2
import uuid

from pipelines.detect_faces import detect_faces
from pipelines.align_faces import align_face
from pipelines.preprocess import preprocess
from pipelines.generate_embeddings import generate_embedding
from pipelines.compare_faces import compare_embeddings

from utils.data_manager import save_embedding


def run_pipeline(img1_path, img2_path):
    img1 = preprocess(cv2.imread(img1_path))
    img2 = preprocess(cv2.imread(img2_path))

    faces1 = detect_faces(img1)
    faces2 = detect_faces(img2)

    if not faces1 or not faces2:
        return {"error": "Face not detected"}

    face1 = max(faces1, key=lambda f: f.det_score)
    face2 = max(faces2, key=lambda f: f.det_score)

    aligned1 = align_face(img1, face1)
    aligned2 = align_face(img2, face2)

    emb1 = generate_embedding(aligned1)
    emb2 = generate_embedding(aligned2)

    if emb1 is None or emb2 is None:
        return {"error": "Embedding failed"}

    # salva embeddings (debug + auditoria)
    id1 = str(uuid.uuid4())
    id2 = str(uuid.uuid4())

    save_embedding(id1, emb1)
    save_embedding(id2, emb2)

    score = compare_embeddings(emb1, emb2)

    return {
        "similarity_score": float(score),
        "embedding_ids": [id1, id2]
    }