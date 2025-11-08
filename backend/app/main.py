# backend/app/main.py

from fastapi import FastAPI
# CORS Middleware'ini import ediyoruz
from fastapi.middleware.cors import CORSMiddleware

# Router'larımızı (endpoint gruplarımızı) import ediyoruz
from app.routers import auth, projects, tasks 

app = FastAPI(title="Proje Yönetim Sistemi API")

# --- YENİ EKLENEN BÖLÜM: CORS YAPILANDIRMASI ---

# Frontend'imizin çalıştığı adres(ler).
# React (Vite) varsayılan olarak 5173'te çalışır.
origins = [
    "http://localhost:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Sadece bu adreslerden gelen isteklere izin ver
    allow_credentials=True, # Kimlik bilgileri (cookie, token vb.) içeren isteklere izin ver
    allow_methods=["*"],    # Tüm HTTP metotlarına (GET, POST, PUT, DELETE) izin ver
    allow_headers=["*"],    # Tüm başlıklara (Header) izin ver
)
# --------------------------------------------------


# Router'ları ana uygulamaya (app) dahil ediyoruz
app.include_router(auth.router)     # /api/auth/... endpoint'leri
app.include_router(projects.router) # /api/projects/... endpoint'leri
app.include_router(tasks.router)    # /api/tasks/... endpoint'leri

# Ana karşılama endpoint'i
@app.get("/")
def read_root():
    return {"message": "YMH455 Proje Yönetim Sistemi API'sine hoş geldiniz!"}