from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime

from app.models.task_model import Task, TaskStatus
from app.models.project_member_model import ProjectMember
from app.schemas import task_schemas

from app.services.notification_service import notification_service
from app.models.project_model import Project

class TaskService:
    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Görev bulunamadı.")
        return task

    @staticmethod
    def verify_task_access(db: Session, task_id: int, user_id: int) -> Task:
        task = TaskService.get_task_by_id(db, task_id)
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == user_id
        ).first()
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Erişim yetkiniz yok.")
        return task

    @staticmethod
    def get_tasks_by_project(db: Session, project_id: int) -> List[Task]:
        return db.query(Task).filter(Task.project_id == project_id).all()

    @staticmethod
    def get_assigned_tasks(db: Session, user_id: int) -> List[Task]:
        """
        Kullanıcıya atanmış görevleri PROJE verisiyle birlikte getir.
        joinedload ile N+1 problemini önler ve veriyi doldururuz.
        """
        return db.query(Task)\
            .options(joinedload(Task.project))\
            .filter(Task.assignee_id == user_id)\
            .all()

    @staticmethod
    def create_task(db: Session, task_data: task_schemas.TaskCreate, project_id: int) -> Task:
        db_task = Task(**task_data.dict(), project_id=project_id)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)

        if db_task.assignee_id:
            project_name = db.query(Project).filter(Project.id == project_id).first().name
            notification_service.create_notification(
                db,
                db_task.assignee_id,
                "Yeni Görev Ataması",
                f"'{project_name}' projesinde '{db_task.title}' görevi size atandı."
            )

        return db_task

    @staticmethod
    def update_task(db: Session, task: Task, update_data: dict) -> Task:
        # 1. ÖNEMLİ: Güncelleme yapmadan ÖNCE eski atanan kişiyi hafızaya al
        old_assignee = task.assignee_id

        # 2. Statü ve Tarih Mantığı
        if "status" in update_data:
            new_status = update_data["status"]
            if new_status == TaskStatus.tamamlandı:
                task.completed_at = datetime.now()
            elif task.status == TaskStatus.tamamlandı and new_status != TaskStatus.tamamlandı:
                task.completed_at = None

        # 3. Verileri Güncelle
        for key, value in update_data.items():
            setattr(task, key, value)
        
        db.add(task)
        db.commit()

        # 4. Bildirim Mantığı
        if "assignee_id" in update_data:
            new_assignee = update_data["assignee_id"]
            
            # Eğer yeni birine atandıysa VE bu kişi eskisiyle aynı değilse
            if new_assignee and new_assignee != old_assignee:
                
                # Proje ismini güvenli bir şekilde çekelim
                from app.models.project_model import Project
                project_record = db.query(Project).filter(Project.id == task.project_id).first()
                project_name = project_record.name if project_record else "Proje"

                # Servisi import et ve bildirimi gönder
                from app.services.notification_service import notification_service
                
                notification_service.create_notification(
                    db,
                    new_assignee,
                    "Görev Size Devredildi",
                    f"'{project_name}' projesinde '{task.title}' görevi size devredildi."
                )

        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()

task_service = TaskService()