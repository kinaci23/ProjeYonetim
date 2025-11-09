from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# 1. GEREKLİ MODELLER
from app.models import project_model, user_model
from app.models.project_member_model import ProjectMember, ProjectRole 
# 2. GÜNCELLENMİŞ ŞEMALAR (Yeni şemalar dahil)
from app.schemas import project_schemas
from app.schemas.project_member_schemas import ProjectMemberInvite, ProjectMemberDisplay, ProjectMemberUpdate 

# 3. GÜVENLİK
from app.services.auth_service import get_current_user, get_project_membership, get_project_admin

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)

# --- YARDIMCI GÜVENLİK FONKSİYONU ---
def get_membership_by_id(
    project_id: int, 
    member_id: int, # Bu, 'project_members' tablosunun kendi ID'si
    db: Session
) -> ProjectMember:
    """Belirli bir üyelik kaydını ID ile bulur."""
    membership = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Üyelik kaydı bulunamadı.")
    return membership

# --- 1. PROJE OLUŞTURMA (Değişiklik yok) ---
@router.post("/", response_model=project_schemas.ProjectDisplay, status_code=status.HTTP_201_CREATED)
def create_project(project: project_schemas.ProjectCreate, db: Session = Depends(get_db), current_user: user_model.User = Depends(get_current_user)):
    db_project = project_model.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project) 
    db_membership = ProjectMember(project_id=db_project.id, user_id=current_user.id, role=ProjectRole.admin)
    db.add(db_membership)
    db.commit()
    db.refresh(db_project)
    return db_project

# --- 2. PROJELERİ LİSTELEME (Değişiklik yok) ---
@router.get("/", response_model=List[project_schemas.ProjectDisplay])
def get_my_projects(db: Session = Depends(get_db), current_user: user_model.User = Depends(get_current_user)):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    projects = [membership.project for membership in memberships]
    return projects

# --- 3. PROJE DETAYINI GETİRME (Değişiklik yok) ---
@router.get("/{project_id}", response_model=project_schemas.ProjectDisplay)
def get_project_by_id(membership: ProjectMember = Depends(get_project_membership)):
    return membership.project

# --- 4. PROJEYE ÜYE EKLEME (Değişiklik yok) ---
@router.post("/{project_id}/members", response_model=ProjectMemberDisplay)
def add_member_to_project(invite_data: ProjectMemberInvite, admin_membership: ProjectMember = Depends(get_project_admin), db: Session = Depends(get_db)):
    user_to_add = db.query(user_model.User).filter(user_model.User.email == invite_data.email).first()
    if not user_to_add:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bu email adresine sahip bir kullanıcı bulunamadı.")
    existing_membership = db.query(ProjectMember).filter(ProjectMember.project_id == admin_membership.project_id, ProjectMember.user_id == user_to_add.id).first()
    if existing_membership:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu kullanıcı zaten projeye üye.")
    new_membership = ProjectMember(project_id=admin_membership.project_id, user_id=user_to_add.id, role=invite_data.role)
    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)
    return new_membership

# -----------------------------------------------------------------
# YENİ ENDPOINT 1 (PROJE GÜNCELLEME) (ADIM 7.1)
# -----------------------------------------------------------------
@router.put("/{project_id}", response_model=project_schemas.ProjectDisplay)
def update_project_details(
    project_data: project_schemas.ProjectUpdate, 
    admin_membership: ProjectMember = Depends(get_project_admin),
    db: Session = Depends(get_db)
):
    """
    Bir projenin adını veya açıklamasını günceller.
    Sadece o projenin 'admin'leri bu işlemi yapabilir.
    """
    db_project = admin_membership.project
    update_data = project_data.dict(exclude_unset=True) 
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek veri gönderilmedi.")
    for key, value in update_data.items():
        setattr(db_project, key, value) 
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# -----------------------------------------------------------------
# YENİ ENDPOINT 2 (PROJE SİLME) (ADIM 7.1)
# -----------------------------------------------------------------
@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    admin_membership: ProjectMember = Depends(get_project_admin),
    db: Session = Depends(get_db)
):
    """
    Bir projeyi ve o projeye bağlı TÜM görevleri ve üyelikleri siler.
    Sadece o projenin 'admin'leri bu işlemi yapabilir.
    """
    db_project = admin_membership.project
    db.delete(db_project)
    db.commit()
    return None 

# -----------------------------------------------------------------
# YENİ ENDPOINT 3 (ÜYE ROLÜ GÜNCELLEME) (ADIM 7.1)
# -----------------------------------------------------------------
@router.put("/{project_id}/members/{member_id}", response_model=ProjectMemberDisplay)
def update_member_role(
    project_id: int,
    member_id: int, # Bu, 'project_members' tablosunun ID'si, user_id DEĞİL
    member_data: ProjectMemberUpdate, # Sadece { "role": "admin" }
    admin_membership: ProjectMember = Depends(get_project_admin),
    db: Session = Depends(get_db)
):
    """
    Bir üyenin projedeki rolünü günceller (örn: member -> admin).
    Sadece o projenin 'admin'leri bu işlemi yapabilir.
    """
    membership_to_update = get_membership_by_id(project_id, member_id, db)
    
    # TODO (İsteğe bağlı): Admin, kendisi dışındaki son adminin rolünü 'member' yapamaz
    
    membership_to_update.role = member_data.role
    db.add(membership_to_update)
    db.commit()
    db.refresh(membership_to_update)
    return membership_to_update

# -----------------------------------------------------------------
# YENİ ENDPOINT 4 (ÜYE SİLME) (ADIM 7.1)
# -----------------------------------------------------------------
@router.delete("/{project_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member_from_project(
    project_id: int,
    member_id: int,
    admin_membership: ProjectMember = Depends(get_project_admin),
    db: Session = Depends(get_db)
):
    """
    Bir üyeyi projeden kaldırır.
    Sadece o projenin 'admin'leri bu işlemi yapabilir.
    """
    membership_to_delete = get_membership_by_id(project_id, member_id, db)
    
    # Güvenlik: Admin kendini projeden atamaz
    if membership_to_delete.user_id == admin_membership.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adminler kendilerini projeden kaldıramaz. Projeyi silmeyi deneyin."
        )
        
    db.delete(membership_to_delete)
    db.commit()
    return None