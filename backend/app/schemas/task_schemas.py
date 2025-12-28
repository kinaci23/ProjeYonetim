from pydantic import BaseModel
from app.models.task_model import TaskStatus, TaskPriority, TaskCategory
from datetime import datetime 
from typing import Optional 

# --- Ortak Alanlar ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.orta
    story_points: int = 1
    category: TaskCategory = TaskCategory.diger

# --- Oluşturma Şeması ---
class TaskCreate(TaskBase):
    assignee_id: Optional[int] = None 

# --- Güncelleme Şeması ---
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None 
    priority: Optional[TaskPriority] = None
    story_points: Optional[int] = None
    category: Optional[TaskCategory] = None

# --- Status Güncelleme ---
class TaskStatusUpdate(BaseModel):
    status: TaskStatus 

# --- Görüntüleme Şeması (Temel) ---
class TaskDisplay(TaskBase):
    id: int
    status: TaskStatus
    completed_at: Optional[datetime] = None
    project_id: int
    assignee_id: Optional[int]
    
    class Config:
        from_attributes = True

# --- YENİ: Proje Bilgisi İçeren Şema (MY TASKS İçin) ---

class ProjectInfo(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class TaskWithProject(TaskDisplay):
    """
    Standart görev verisine ek olarak 'project' objesini de içerir.
    422 Hatasını önlemek için Optional yapıyoruz.
    """
    project: Optional[ProjectInfo] = None
    
    class Config:
        from_attributes = True