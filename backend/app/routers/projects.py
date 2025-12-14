from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import user_model
# Şemalar
from app.schemas import project_schemas
from app.schemas.project_member_schemas import ProjectMemberDisplay, ProjectMemberInvite, ProjectMemberUpdate
# Servisler
from app.services.auth_service import get_current_user
from app.services.project_service import project_service # Yeni servisi ekledik

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

# --- PROJE İŞLEMLERİ ---

@router.get("/", response_model=List[project_schemas.ProjectDisplay])
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Kullanıcının projelerini listeler."""
    return project_service.get_user_projects(db, current_user.id)

@router.post("/", response_model=project_schemas.ProjectDisplay, status_code=status.HTTP_201_CREATED)
def create_project(
    project: project_schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Yeni proje oluşturur."""
    return project_service.create_project(db, project, current_user.id)

@router.get("/{project_id}", response_model=project_schemas.ProjectDisplay)
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Proje detayını getirir."""
    return project_service.get_project_by_id(db, project_id, current_user.id)

@router.put("/{project_id}", response_model=project_schemas.ProjectDisplay)
def update_project_details(
    project_id: int,
    project_data: project_schemas.ProjectUpdate, 
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Proje bilgilerini günceller (Admin)."""
    return project_service.update_project(db, project_id, current_user.id, project_data)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Projeyi siler (Admin)."""
    return project_service.delete_project(db, project_id, current_user.id)

# --- ÜYE YÖNETİMİ ---

@router.post("/{project_id}/members", response_model=ProjectMemberDisplay)
def add_member_to_project(
    project_id: int,
    invite_data: ProjectMemberInvite,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Projeye üye ekler (Admin)."""
    return project_service.add_member(db, project_id, current_user.id, invite_data)

@router.put("/{project_id}/members/{member_id}", response_model=ProjectMemberDisplay)
def update_member_role(
    project_id: int,
    member_id: int,
    member_data: ProjectMemberUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Üye rolünü günceller (Admin)."""
    return project_service.update_member_role(db, project_id, current_user.id, member_id, member_data.role)

@router.delete("/{project_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member_from_project(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """Üyeyi projeden çıkarır (Admin)."""
    return project_service.remove_member(db, project_id, current_user.id, member_id)