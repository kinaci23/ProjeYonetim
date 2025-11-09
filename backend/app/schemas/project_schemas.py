from pydantic import BaseModel
from typing import List, Optional # 'Optional' import edildi
from app.schemas.project_member_schemas import ProjectMemberDisplay 

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None 

class ProjectCreate(ProjectBase):
    """Proje oluştururken (Değişiklik yok)."""
    pass 

class ProjectDisplay(BaseModel):
    """Proje verisini dönerken (Değişiklik yok)."""
    id: int
    name: str
    description: Optional[str] = None
    memberships: List[ProjectMemberDisplay]
    
    class Config:
        from_attributes = True 

# --- YENİ EKLENEN ŞEMA (ADIM 7.1) ---
class ProjectUpdate(BaseModel):
    """
    Bir projenin detaylarını güncellerken
    kullanıcıdan alınacak veri. Tüm alanlar opsiyoneldir.
    """
    name: Optional[str] = None
    description: Optional[str] = None