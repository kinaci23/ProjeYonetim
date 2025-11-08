from pydantic import BaseModel
from app.models.task_model import TaskStatus
from datetime import datetime 
from typing import Optional 

# --- Görev Şemaları ---

class TaskBase(BaseModel):
    """Tüm görev şemalarının paylaştığı temel alanlar."""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    """Yeni görev oluştururken (Değişmedi)."""
    assignee_id: Optional[int] = None 

class TaskStatusUpdate(BaseModel):
    """Sadece 'status' güncellemek için (Sürükle-Bırak) (Değişmedi)."""
    status: TaskStatus 

class TaskDisplay(TaskBase):
    """API'den görev verisi dönerken (Değişmedi)."""
    id: int
    status: TaskStatus
    project_id: int
    assignee_id: Optional[int]
    
    class Config:
        from_attributes = True

# --- YENİ EKLENEN ŞEMA (ADIM 6.1) ---
class TaskUpdate(BaseModel):
    """
    Bir görevin detaylarını (başlık, açıklama vb.) güncellerken
    kullanıcıdan alınacak veri. Tüm alanlar opsiyoneldir.
    """
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None 
    # Not: 'status' (durum) bu endpoint ile güncellenmez,
    # o sürükle-bırak (TaskStatusUpdate) endpoint'i ile yapılır.