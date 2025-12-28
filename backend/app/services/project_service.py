from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List

from app.models.project_model import Project
from app.models.user_model import User
from app.models.project_member_model import ProjectMember, ProjectRole
from app.schemas import project_schemas, project_member_schemas
from app.services.notification_service import notification_service

class ProjectService:
    
    @staticmethod
    def get_project_by_id(db: Session, project_id: int, user_id: int) -> Project:
        """
        Projeyi getirir ve kullanıcının üye olup olmadığını kontrol eder.
        """
        # Önce üyelik kontrolü
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu projeye erişim yetkiniz yok."
            )
        
        return membership.project

    @staticmethod
    def get_user_projects(db: Session, user_id: int) -> List[Project]:
        """Kullanıcının üye olduğu tüm projeleri listeler."""
        memberships = db.query(ProjectMember).filter(ProjectMember.user_id == user_id).all()
        return [m.project for m in memberships]

    @staticmethod
    def create_project(db: Session, project_data: project_schemas.ProjectCreate, user_id: int) -> Project:
        """Yeni proje oluşturur ve oluşturanı Admin yapar."""
        # 1. Projeyi oluştur
        db_project = Project(**project_data.dict())
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        # 2. Üyeliği (Admin) ekle
        db_membership = ProjectMember(
            project_id=db_project.id,
            user_id=user_id,
            role=ProjectRole.admin
        )
        db.add(db_membership)
        db.commit()
        db.refresh(db_project)
        
        return db_project

    @staticmethod
    def update_project(db: Session, project_id: int, user_id: int, project_data: project_schemas.ProjectUpdate) -> Project:
        """Sadece Admin'ler projeyi güncelleyebilir."""
        # Admin kontrolü
        ProjectService._verify_admin(db, project_id, user_id)
        
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Proje bulunamadı.")

        update_data = project_data.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Güncellenecek veri gönderilmedi.")

        for key, value in update_data.items():
            setattr(db_project, key, value)
            
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def delete_project(db: Session, project_id: int, user_id: int) -> None:
        """Proje ve bağlı tüm verileri siler (Sadece Admin)."""
        ProjectService._verify_admin(db, project_id, user_id)
        
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if db_project:
            db.delete(db_project)
            db.commit()

    @staticmethod
    def add_member(db: Session, project_id: int, user_id: int, invite_data: project_member_schemas.ProjectMemberInvite) -> ProjectMember:
        """Projeye yeni üye ekler (Sadece Admin)."""
        ProjectService._verify_admin(db, project_id, user_id)
        
        user_to_add = db.query(User).filter(User.email == invite_data.email).first()
        if not user_to_add:
            raise HTTPException(status_code=404, detail="Bu email adresine sahip kullanıcı bulunamadı.")
            
        existing = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_to_add.id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Kullanıcı zaten projeye üye.")
            
        new_member = ProjectMember(
            project_id=project_id,
            user_id=user_to_add.id,
            role=invite_data.role
        )
        db.add(new_member)
        db.commit()

        project_name = db.query(Project).filter(Project.id == project_id).first().name
        notification_service.create_notification(
            db, 
            user_to_add.id, # Yeni eklenen üyeye git
            "Yeni Proje Üyeliği", 
            f"'{project_name}' projesine üye olarak eklendiniz."
        )
        
        db.refresh(new_member)
        return new_member

    @staticmethod
    def remove_member(db: Session, project_id: int, admin_user_id: int, member_id: int) -> None:
        """Üyeyi projeden çıkarır (Sadece Admin)."""
        ProjectService._verify_admin(db, project_id, admin_user_id)
        
        membership = db.query(ProjectMember).filter(ProjectMember.id == member_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Üyelik kaydı bulunamadı.")
            
        # Admin kendini silemez (Proje silme kullanılmalı)
        if membership.user_id == admin_user_id:
            raise HTTPException(status_code=400, detail="Admin kendini projeden atamaz.")
            
        db.delete(membership)
        db.commit()

    @staticmethod
    def update_member_role(db: Session, project_id: int, admin_user_id: int, member_id: int, role: ProjectRole) -> ProjectMember:
        """Üye rolünü günceller (Sadece Admin)."""
        ProjectService._verify_admin(db, project_id, admin_user_id)
        
        membership = db.query(ProjectMember).filter(ProjectMember.id == member_id).first()
        if not membership:
            raise HTTPException(status_code=404, detail="Üyelik kaydı bulunamadı.")
            
        membership.role = role
        db.add(membership)
        db.commit()
        db.refresh(membership)
        return membership

    # --- YARDIMCI METOD ---
    @staticmethod
    def _verify_admin(db: Session, project_id: int, user_id: int):
        """Kullanıcının projede ADMIN olup olmadığını kontrol eder."""
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        ).first()
        
        if not membership or membership.role != ProjectRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için proje yöneticisi (Admin) olmalısınız."
            )

project_service = ProjectService()