from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# 1. GEREKLİ MODELLER
from app.models import user_model

# 2. GÜNCELLENMİŞ ŞEMALAR (Yeni şemalarımız)
from app.schemas import user_schemas

# 3. GÜVENLİK (Giriş yapan kullanıcıyı almak için)
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/api/users", # Yeni prefix'imiz
    tags=["Users"]       # API dökümantasyonu için yeni etiket
)

# --- YENİ ENDPOINT 1 (PROFIL BİLGİSİ GETİRME) ---
@router.get("/me", response_model=user_schemas.UserDisplay)
def get_current_user_profile(
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Giriş yapmış mevcut kullanıcının profil bilgilerini döndürür.
    (Token'ı çözer ve kullanıcıyı döndürür)
    """
    return current_user

# --- YENİ ENDPOINT 2 (PROFIL BİLGİSİ GÜNCELLEME) ---
@router.put("/me", response_model=user_schemas.UserDisplay)
def update_current_user_profile(
    profile_data: user_schemas.ProfileUpdate, # Body'den {first_name, last_name, title} alır
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Giriş yapmış mevcut kullanıcının profil bilgilerini (isim, soyisim, unvan) günceller.
    """
    
    # Gelen veriyi (profile_data) bir sözlüğe (dictionary) çevir.
    # exclude_unset=True: Sadece frontend'den gönderilen alanları alır
    # (örn: Sadece 'title' gönderildiyse, 'first_name' ve 'last_name' None gelmez)
    update_data = profile_data.dict(exclude_unset=True) 

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek veri gönderilmedi.")

    # Veritabanı modelimiz (current_user) üzerinde
    # sözlükteki (update_data) her bir anahtar/değer (key/value) için
    # setattr fonksiyonunu kullanarak güncelleme yap.
    for key, value in update_data.items():
        setattr(current_user, key, value) 
    
    db.add(current_user) # Değişiklikleri session'a ekle
    db.commit()          # Değişiklikleri veritabanına işle
    db.refresh(current_user) # Güncellenmiş veriyi DB'den tekrar çek
    
    return current_user