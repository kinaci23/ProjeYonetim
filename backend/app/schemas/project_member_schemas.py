from pydantic import BaseModel, EmailStr 
from app.models.project_member_model import ProjectRole
from app.schemas.user_schemas import UserDisplay 

class ProjectMemberDisplay(BaseModel):
    """Proje üyesini gösterirken kullanılacak şema (GÜNCELLENDİ)."""
    id: int # YENİ EKLEME: Üyeyi silmek/güncellemek için 'project_members' tablosunun ID'sine ihtiyacımız var
    role: ProjectRole
    user: UserDisplay 

    class Config:
        from_attributes = True

class ProjectMemberInvite(BaseModel):
    """Email ile davet şeması (Değişiklik yok)."""
    email: EmailStr 
    role: ProjectRole = ProjectRole.member 

# --- YENİ EKLENEN ŞEMA (ADIM 7.1) ---
class ProjectMemberUpdate(BaseModel):
    """
    Bir üyenin rolünü güncellerken kullanılacak veri.
    Sadece 'role' alanı gereklidir.
    """
    role: ProjectRole # "admin" veya "member"