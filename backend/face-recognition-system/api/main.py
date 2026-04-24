from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.face_routes import router as face_router

app = FastAPI(
    title="OpenLocate Face Recognition API",
    description="API for biometric similarity analysis (research & investigation use only)",
    version="1.0.0"
)

# CORS (libera frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # depois você restringe
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(face_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "OpenLocate API is running",
        "warning": "This system requires human validation and legal authorization"
    }