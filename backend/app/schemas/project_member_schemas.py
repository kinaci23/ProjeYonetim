from pydantic import BaseModel, EmailStr 
from app.models.project_member_model import ProjectRole
from app.schemas.user_schemas import UserDisplay 

class ProjectMemberDisplay(BaseModel):
    # 'id: int' (Adım 7'de eklenmişti) kaldırıldı
    role: ProjectRole
    user: UserDisplay 

    class Config:
        from_attributes = True

class ProjectMemberInvite(BaseModel):
    email: EmailStr 
    role: ProjectRole = ProjectRole.member 

# --- ProjectMemberUpdate şeması SİLİNDİ ---