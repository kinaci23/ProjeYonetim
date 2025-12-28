from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import user_model
from app.models.project_member_model import ProjectMember
# Şemalar
from app.schemas import task_schemas
# Servisler
from app.services.auth_service import get_current_user, get_project_membership
from app.services.task_service import task_service

router = APIRouter(
    prefix="/api", 
    tags=["Tasks"]
)

# --- ENDPOINTLER ---

# 1. Proje Bazlı Görevler
@router.get("/projects/{project_id}/tasks", response_model=List[task_schemas.TaskDisplay])
def get_tasks_for_project(
    project_id: int,
    membership: ProjectMember = Depends(get_project_membership),
    db: Session = Depends(get_db)
):
    return task_service.get_tasks_by_project(db, project_id)

# 2. Görev Oluşturma
@router.post("/projects/{project_id}/tasks", response_model=task_schemas.TaskDisplay, status_code=status.HTTP_201_CREATED)
def create_task_in_project(
    project_id: int,
    task_data: task_schemas.TaskCreate, 
    membership: ProjectMember = Depends(get_project_membership),
    db: Session = Depends(get_db)
):
    return task_service.create_task(db, task_data, project_id)

# --- YENİ ENDPOINT: GÖREVLERİM (DÜZELTİLDİ) ---
@router.get("/tasks/my-tasks", response_model=List[task_schemas.TaskWithProject])
def get_my_assigned_tasks(
    db: Session = Depends(get_db), 
    current_user: user_model.User = Depends(get_current_user) 
):
    """
    Giriş yapmış kullanıcının kendisine atanmış TÜM görevleri listeler.
    Proje detaylarını da içerir.
    """
    tasks = task_service.get_assigned_tasks(db, current_user.id)
    return tasks
# ---------------------------------------------

# 3. Görev Detayı
@router.get("/tasks/{task_id}", response_model=task_schemas.TaskDisplay)
def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    return task_service.verify_task_access(db, task_id, current_user.id)

# 4. Görev Güncelleme
@router.put("/tasks/{task_id}", response_model=task_schemas.TaskDisplay)
def update_task_details(
    task_id: int,
    task_data: task_schemas.TaskUpdate, 
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    db_task = task_service.verify_task_access(db, task_id, current_user.id)
    update_data = task_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek veri gönderilmedi.")
    return task_service.update_task(db, db_task, update_data)

# 5. Görev Silme
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    db_task = task_service.verify_task_access(db, task_id, current_user.id)
    task_service.delete_task(db, db_task)
    return None 

# 6. Status Güncelleme
@router.put("/tasks/{task_id}/status", response_model=task_schemas.TaskDisplay)
def update_task_status(
    task_id: int,
    status_update: task_schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    db_task = task_service.verify_task_access(db, task_id, current_user.id)
    return task_service.update_task(db, db_task, {"status": status_update.status})