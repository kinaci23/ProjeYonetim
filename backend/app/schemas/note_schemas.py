from pydantic import BaseModel
from typing import Optional

# --- Not Şemaları ---

class NoteBase(BaseModel):
    """Not oluştururken veya güncellerken ortak alanlar."""
    title: Optional[str] = None
    content: Optional[str] = None

class NoteCreate(NoteBase):
    """
    Yeni not oluştururken. 
    Modelimizde 'title' için "Yeni Not" default değeri olduğu için
    boş bile gönderilebilir.
    """
    pass

class NoteUpdate(NoteBase):
    """
    Notu güncellerken. Alanlar opsiyoneldir,
    sadece gönderilen alan güncellenir.
    """
    pass

class NoteDisplay(BaseModel):
    """API'den not verisi dönerken kullanılacak şema."""
    id: int
    title: str
    content: Optional[str] = None
    user_id: int # Notun sahibini bilmek için

    class Config:
        from_attributes = True # (Bu 'orm_mode = True' idi)