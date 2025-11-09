from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import project_model, user_model
from app.models.project_member_model import ProjectMember, ProjectRole 
from app.schemas import project_schemas
from app.schemas.project_member_schemas import ProjectMemberInvite, ProjectMemberDisplay

from app.services.auth_service import get_current_user, get_project_membership, get_project_admin

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

# --- 1. YENİ PROJE OLUŞTUR (Çalışan kod) ---
@router.post("/", response_model=project_schemas.ProjectDisplay, status_code=status.HTTP_201_CREATED)
def create_project(
    project: project_schemas.ProjectCreate, 
    db: Session = Depends(get_db), 
    current_user: user_model.User = Depends(get_current_user) 
):
    db_project = project_model.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project) 
    db_membership = ProjectMember(
        project_id=db_project.id,
        user_id=current_user.id,
        role=ProjectRole.admin 
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_project)
    return db_project

# --- 2. PROJELERİMİ LİSTELE (Çalışan kod) ---
@router.get("/", response_model=List[project_schemas.ProjectDisplay])
def get_my_projects(
    db: Session = Depends(get_db), 
    current_user: user_model.User = Depends(get_current_user) 
):
    memberships = db.query(ProjectMember).filter(
        ProjectMember.user_id == current_user.id
    ).all()
    projects = [membership.project for membership in memberships]
    return projects

# --- 3. TEK BİR PROJEYİ GETİR (Çalışan kod) ---
@router.get("/{project_id}", response_model=project_schemas.ProjectDisplay)
def get_project_by_id(
    membership: ProjectMember = Depends(get_project_membership)
):
    return membership.project

# --- 4. PROJEYE ÜYE EKLE (Çalışan kod) ---
@router.post("/{project_id}/members", response_model=ProjectMemberDisplay)
def add_member_to_project(
    invite_data: ProjectMemberInvite, 
    admin_membership: ProjectMember = Depends(get_project_admin),
    db: Session = Depends(get_db)
):
    user_to_add = db.query(user_model.User).filter(user_model.User.email == invite_data.email).first()
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bu email adresine sahip bir kullanıcı bulunamadı."
        )
    existing_membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == admin_membership.project_id,
        ProjectMember.user_id == user_to_add.id
    ).first()
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu kullanıcı zaten projeye üye."
        )
    new_membership = ProjectMember(
        project_id=admin_membership.project_id,
        user_id=user_to_add.id,
        role=invite_data.role 
    )
    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)
    return new_membership

# --- Adım 7'de eklenen PUT, DELETE endpoint'leri SİLİNDİ ---