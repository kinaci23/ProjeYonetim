# backend/app/main.py

from fastapi import FastAPI
# CORS Middleware'ini import ediyoruz
from fastapi.middleware.cors import CORSMiddleware

# Router'larımızı (endpoint gruplarımızı) import ediyoruz
# YENİ: 'analysis' buraya eklendi
from app.routers import auth, projects, tasks, users, notes, analysis 

from app.routers import auth, projects, tasks, users, notes, analysis, notifications

app = FastAPI(title="Proje Yönetim Sistemi API")

# --- YENİ EKLENEN BÖLÜM: CORS YAPILANDIRMASI ---

# Frontend'imizin çalıştığı adres(ler).
# React (Vite) varsayılan olarak 5173'te çalışır.
origins = [
    "http://localhost:5173",
    "https://proje-yonetim.vercel.app/login",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------------------------------


# Router'ları ana uygulamaya (app) dahil ediyoruz
app.include_router(auth.router)     # /api/auth/... endpoint'leri
app.include_router(projects.router) # /api/projects/... endpoint'leri
app.include_router(tasks.router)    # /api/tasks/... endpoint'leri
app.include_router(users.router)    # /api/users/... endpoint'leri
app.include_router(notes.router)    # /api/notes/... endpoint'leri
app.include_router(analysis.router) # YENİ: /api/projects/{id}/analyze endpoint'i
app.include_router(notifications.router)

# Ana karşılama endpoint'i
@app.get("/")
def read_root():
    return {"message": "YMH455 Proje Yönetim Sistemi API'sine hoş geldiniz!"}