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
from app.services.task_service import task_service # Yeni servisimizi import ettik

router = APIRouter(
    prefix="/api", 
    tags=["Tasks"]
)

# --- ENDPOINTLER ---

@router.get("/projects/{project_id}/tasks", response_model=List[task_schemas.TaskDisplay])
def get_tasks_for_project(
    project_id: int,
    membership: ProjectMember = Depends(get_project_membership),
    db: Session = Depends(get_db)
):
    """
    Belirli bir projedeki TÜM görevleri listeler.
    """
    # Yetki kontrolü (get_project_membership) zaten yapıldı.
    # İş mantığı servisten çağrılıyor:
    return task_service.get_tasks_by_project(db, project_id)

@router.post("/projects/{project_id}/tasks", response_model=task_schemas.TaskDisplay, status_code=status.HTTP_201_CREATED)
def create_task_in_project(
    project_id: int,
    task_data: task_schemas.TaskCreate, 
    membership: ProjectMember = Depends(get_project_membership),
    db: Session = Depends(get_db)
):
    """
    Belirli bir projeye yeni bir görev oluşturur.
    """
    return task_service.create_task(db, task_data, project_id)

@router.get("/tasks/{task_id}", response_model=task_schemas.TaskDisplay)
def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Tek bir görevin detaylarını ID ile getirir.
    """
    # Servis hem görevi bulur hem yetkiyi kontrol eder
    return task_service.verify_task_access(db, task_id, current_user.id)

@router.put("/tasks/{task_id}", response_model=task_schemas.TaskDisplay)
def update_task_details(
    task_id: int,
    task_data: task_schemas.TaskUpdate, 
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Bir görevin detaylarını günceller.
    """
    # 1. Görevi ve yetkiyi al
    db_task = task_service.verify_task_access(db, task_id, current_user.id)
    
    # 2. Veriyi hazırla
    update_data = task_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek veri gönderilmedi.")

    # 3. Servis ile güncelle
    return task_service.update_task(db, db_task, update_data)

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Bir görevi siler.
    """
    db_task = task_service.verify_task_access(db, task_id, current_user.id)
    task_service.delete_task(db, db_task)
    return None 

@router.put("/tasks/{task_id}/status", response_model=task_schemas.TaskDisplay)
def update_task_status(
    task_id: int,
    status_update: task_schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Bir görevin durumunu (status) günceller.
    """
    db_task = task_service.verify_task_access(db, task_id, current_user.id)
    return task_service.update_task(db, db_task, {"status": status_update.status})

@router.get("/tasks/my-tasks", response_model=List[task_schemas.TaskDisplay])
def get_my_assigned_tasks(
    db: Session = Depends(get_db), 
    current_user: user_model.User = Depends(get_current_user) 
):
    """
    Giriş yapmış kullanıcının kendisine atanmış TÜM görevleri listeler.
    """
    return task_service.get_assigned_tasks(db, current_user.id)