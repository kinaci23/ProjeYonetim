from pydantic import BaseModel, EmailStr
from typing import Optional # YENİ: Opsiyonel alanlar için

# --- Token Şemaları (Değişmedi) ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Kullanıcı Şemaları (DEĞİŞTİ) ---

class UserCreate(BaseModel):
    """Kullanıcı kaydı için gerekenler. 'role' alanı kaldırıldı."""
    email: EmailStr
    password: str

class UserDisplay(BaseModel):
    """API'den kullanıcı bilgisi dönerken (GÜNCELLENDİ)."""
    id: int
    email: EmailStr
    
    # --- YENİ EKLENEN PROFİL ALANLARI ---
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    title: Optional[str] = None
    # -------------------------------------
    
    class Config:
        from_attributes = True # (Bu 'orm_mode = True' idi, doğru)

# --- YENİ EKLENEN ŞEMA ---
class ProfileUpdate(BaseModel):
    """
    Kullanıcı profilini güncellerken (PUT /api/users/me)
    kullanıcıdan alınacak veri. Tüm alanlar opsiyoneldir.
    """
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    title: Optional[str] = None