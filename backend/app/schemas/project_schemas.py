from pydantic import BaseModel
from typing import List, Optional 
from app.schemas.project_member_schemas import ProjectMemberDisplay 

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None 

class ProjectCreate(ProjectBase):
    pass 

class ProjectDisplay(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    memberships: List[ProjectMemberDisplay]
    
    class Config:
        from_attributes = True 

# --- ProjectUpdate şeması SİLİNDİ ---