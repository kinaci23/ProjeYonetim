from pydantic import BaseModel, EmailStr

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
    """API'den kullanıcı bilgisi dönerken 'role' alanı kaldırıldı."""
    id: int
    email: EmailStr
    
    class Config:
        from_attributes = True # (Bu 'orm_mode = True' idi, doğru)