from pydantic import BaseModel
from app.models.task_model import TaskStatus, TaskPriority, TaskCategory
from datetime import datetime 
from typing import Optional 

# --- Ortak Alanlar ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    # YENİ ALANLAR
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
    # YENİLERİN GÜNCELLENMESİ
    priority: Optional[TaskPriority] = None
    story_points: Optional[int] = None
    category: Optional[TaskCategory] = None
    # completed_at'i manuel güncellemeyeceğiz, status değişince otomatik olacak

# --- Status Güncelleme (Sürükle-Bırak) ---
class TaskStatusUpdate(BaseModel):
    status: TaskStatus 

# --- Görüntüleme Şeması ---
class TaskDisplay(TaskBase):
    id: int
    status: TaskStatus
    completed_at: Optional[datetime] = None # Bunu da dönelim
    project_id: int
    assignee_id: Optional[int]
    
    class Config:
        from_attributes = True