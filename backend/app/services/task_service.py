from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime

from app.models.task_model import Task, TaskStatus
from app.models.project_member_model import ProjectMember
from app.schemas import task_schemas

class TaskService:
    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Görev bulunamadı.")
        return task

    @staticmethod
    def verify_task_access(db: Session, task_id: int, user_id: int) -> Task:
        """Kullanıcının göreve erişim yetkisi olup olmadığını kontrol eder."""
        task = TaskService.get_task_by_id(db, task_id)
        
        membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == task.project_id,
            ProjectMember.user_id == user_id
        ).first()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Bu göreve erişim yetkiniz yok (proje üyesi değilsiniz)."
            )
        return task

    @staticmethod
    def get_tasks_by_project(db: Session, project_id: int) -> List[Task]:
        return db.query(Task).filter(Task.project_id == project_id).all()

    @staticmethod
    def get_assigned_tasks(db: Session, user_id: int) -> List[Task]:
        return db.query(Task).filter(Task.assignee_id == user_id).all()

    @staticmethod
    def create_task(db: Session, task_data: task_schemas.TaskCreate, project_id: int) -> Task:
        db_task = Task(
            **task_data.dict(),
            project_id=project_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def update_task(db: Session, task: Task, update_data: dict) -> Task:
        # --- OTOMATİK TARİH MANTIĞI ---
        # Eğer statü güncelleniyorsa kontrol et:
        if "status" in update_data:
            new_status = update_data["status"]
            
            # Eğer 'tamamlandı' olduysa -> Şu anki zamanı bas
            if new_status == TaskStatus.tamamlandı:
                task.completed_at = datetime.now()
            # Eğer 'tamamlandı'dan geri alındıysa -> Tarihi sil
            elif task.status == TaskStatus.tamamlandı and new_status != TaskStatus.tamamlandı:
                task.completed_at = None
        # -----------------------------

        for key, value in update_data.items():
            setattr(task, key, value)
        
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()

task_service = TaskService()