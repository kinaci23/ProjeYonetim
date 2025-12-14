# backend/app/models/task_model.py

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

# --- ENUM Sınıfları (Sabit Değerler) ---

class TaskStatus(str, enum.Enum):
    beklemede = "beklemede"
    yapılıyor = "yapılıyor"
    tamamlandı = "tamamlandı"

class TaskPriority(str, enum.Enum):
    dusuk = "Düşük"
    orta = "Orta"
    yuksek = "Yüksek"
    kritik = "Kritik"

class TaskCategory(str, enum.Enum):
    frontend = "Frontend"
    backend = "Backend"
    tasarim = "Tasarım"
    test = "Test"
    devops = "DevOps"
    diger = "Diğer"

# --- Model Tanımı ---

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Durum ve Tarihler
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.beklemede)
    due_date = Column(DateTime, nullable=True)          # Son teslim tarihi
    completed_at = Column(DateTime, nullable=True)      # YENİ: Gerçekleşen bitiş tarihi (Hız analizi için)
    
    # YENİ: Analiz İçin Kritik Veriler
    priority = Column(Enum(TaskPriority), nullable=False, default=TaskPriority.orta) # Öncelik
    story_points = Column(Integer, nullable=False, default=1)  # Zorluk Puanı (Fibonacci)
    category = Column(Enum(TaskCategory), nullable=False, default=TaskCategory.diger) # Departman/Alan
    
    # İlişkiler
    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="tasks")
    
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assignee = relationship("User", back_populates="tasks")