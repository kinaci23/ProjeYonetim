from fastapi.testclient import TestClient
import sys
import os

# 1. Backend klasörünü yola ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 2. Modülü doğru yerden import et
from app.main import app 

client = TestClient(app)

def test_api_docs_access():
    """Swagger dokümantasyon sayfası açılıyor mu?"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_register_flow():
    """Kayıt olma ve token alma testi"""
    import random
    rand_id = random.randint(1000, 9999)
    fake_email = f"testuser{rand_id}@example.com"
    fake_pass = "test1234"

    # --- DÜZELTME 1: ADRES /api/auth/register OLMALI ---
    # main.py'deki yoruma göre Auth işlemleri '/api/auth' altında.
    response = client.post("/api/auth/register", json={
        "email": fake_email,
        "password": fake_pass,
        "first_name": "Test",
        "last_name": "Robot"
    })
    
    # Hata ayıklama: 404 veya 422 alırsak detayı görelim
    if response.status_code not in [200, 201]:
        print(f"Kayıt Hatası: {response.status_code} - {response.text}")

    assert response.status_code in [200, 201]

    # --- DÜZELTME 2: GİRİŞ ADRESİ /api/auth/login OLMALI ---
    login_response = client.post("/api/auth/login", data={
        "username": fake_email,
        "password": fake_pass
    })
    
    if login_response.status_code != 200:
        print(f"Giriş Hatası: {login_response.status_code} - {login_response.text}")

    assert login_response.status_code == 200