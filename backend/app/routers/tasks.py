from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# Gerekli tüm modeller
from app.models import task_model, user_model
from app.models.project_member_model import ProjectMember, ProjectRole
# Güncellenmiş Task şemaları (task_schemas.TaskUpdate dahil)
from app.schemas import task_schemas
# Güvenlik fonksiyonları
from app.services.auth_service import get_current_user, get_project_membership

router = APIRouter(
    prefix="/api", 
    tags=["Tasks"]
)

# --- YARDIMCI GÜVENLİK FONKSİYONU ---
def get_task_and_verify_membership(
    task_id: int, 
    db: Session, 
    current_user: user_model.User
) -> task_model.Task:
    """
    1. Görevi ID ile bulur.
    2. Mevcut kullanıcının o görevin projesine üye olup olmadığını kontrol eder.
    3. Güvenlik kontrolünden geçerse 'task' nesnesini, geçmezse hata döndürür.
    """
    db_task = db.query(task_model.Task).filter(task_model.Task.id == task_id).first()

    if db_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Görev bulunamadı")
    
    # Güvenlik Kontrolü: Kullanıcı bu görevin projesine üye mi?
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == db_task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Bu göreve erişim yetkiniz yok (proje üyesi değilsiniz)."
        )
    
    return db_task # Güvenlikten geçti, görevi döndür

# -----------------------------------------------------------------
# MEVCUT ENDPOINT (Trello Panosu) (Değişiklik yok)
# -----------------------------------------------------------------
@router.get("/projects/{project_id}/tasks", response_model=List[task_schemas.TaskDisplay])
def get_tasks_for_project(
    membership: ProjectMember = Depends(get_project_membership)
):
    """
    Belirli bir projedeki TÜM görevleri listeler.
    Sadece o projenin üyeleri (admin veya member) erişebilir.
    """
    return membership.project.tasks

# -----------------------------------------------------------------
# MEVCUT ENDPOINT (Trello Kartı Oluşturma) (Değişiklik yok)
# -----------------------------------------------------------------
@router.post("/projects/{project_id}/tasks", response_model=task_schemas.TaskDisplay, status_code=status.HTTP_201_CREATED)
def create_task_in_project(
    task_data: task_schemas.TaskCreate, 
    membership: ProjectMember = Depends(get_project_membership),
    db: Session = Depends(get_db)
):
    """
    Belirli bir projeye yeni bir görev oluşturur.
    Sadece o projenin üyeleri (admin veya member) erişebilir.
    """
    db_task = task_model.Task(
        **task_data.dict(),
        project_id=membership.project_id 
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# -----------------------------------------------------------------
# YENİ ENDPOINT (GÖREV DETAYINI GETİRME) (ADIM 6.1)
# -----------------------------------------------------------------
@router.get("/tasks/{task_id}", response_model=task_schemas.TaskDisplay)
def get_task_by_id(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Tek bir görevin detaylarını ID ile getirir.
    Sadece o görevin ait olduğu projenin üyeleri erişebilir.
    """
    # Güvenlik kontrolü ve görevi alma işlemi yardımcı fonksiyon tarafından yapılır
    db_task = get_task_and_verify_membership(task_id=task_id, db=db, current_user=current_user)
    return db_task

# -----------------------------------------------------------------
# YENİ ENDPOINT (GÖREV GÜNCELLEME) (ADIM 6.1)
# -----------------------------------------------------------------
@router.put("/tasks/{task_id}", response_model=task_schemas.TaskDisplay)
def update_task_details(
    task_id: int,
    task_data: task_schemas.TaskUpdate, # Yeni şemamızı kullanıyoruz
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Bir görevin detaylarını (başlık, açıklama, tarih, atanan kişi) günceller.
    'status' (durum) bu endpoint ile DEĞİŞTİRİLMEZ.
    Sadece o görevin ait olduğu projenin üyeleri erişebilir.
    """
    db_task = get_task_and_verify_membership(task_id=task_id, db=db, current_user=current_user)
    
    update_data = task_data.dict(exclude_unset=True) 

    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek veri gönderilmedi.")

    for key, value in update_data.items():
        setattr(db_task, key, value) 
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# -----------------------------------------------------------------
# YENİ ENDPOINT (GÖREV SİLME) (ADIM 6.1)
# -----------------------------------------------------------------
@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Bir görevi ID ile siler.
    Sadece o görevin ait olduğu projenin üyeleri erişebilir.
    """
    db_task = get_task_and_verify_membership(task_id=task_id, db=db, current_user=current_user)
    
    db.delete(db_task)
    db.commit()
    return None 

# -----------------------------------------------------------------
# MEVCUT ENDPOINT (Sürükle-Bırak) (Güvenlik Düzeltmesi)
# -----------------------------------------------------------------
@router.put("/tasks/{task_id}/status", response_model=task_schemas.TaskDisplay)
def update_task_status(
    task_id: int,
    status_update: task_schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Bir görevin durumunu (status) günceller (Sürükle-Bırak).
    Sadece o görevin ait olduğu projenin üyeleri güncelleyebilir.
    """
    db_task = get_task_and_verify_membership(task_id=task_id, db=db, current_user=current_user)
    
    db_task.status = status_update.status
    db.commit()
    db.refresh(db_task)
    return db_task

# -----------------------------------------------------------------
# MEVCUT ENDPOINT (Benim Görevlerim) (Değişiklik yok)
# -----------------------------------------------------------------
@router.get("/tasks/my-tasks", response_model=List[task_schemas.TaskDisplay])
def get_my_assigned_tasks(
    db: Session = Depends(get_db), 
    current_user: user_model.User = Depends(get_current_user) 
):
    """
    Giriş yapmış kullanıcının kendisine atanmış TÜM görevleri listeler.
    """
    tasks = db.query(task_model.Task).filter(task_model.Task.assignee_id == current_user.id).all()
    return tasks