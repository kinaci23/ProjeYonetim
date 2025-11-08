# backend/app/models/task_model.py

# 'Text' ve 'DateTime' import edildi
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class TaskStatus(str, enum.Enum):
    beklemede = "beklemede"
    yapılıyor = "yapılıyor"
    tamamlandı = "tamamlandı"

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    status = Column(Enum(TaskStatus), nullable=False, default=TaskStatus.beklemede)
    
    # --- YENİ EKLENEN SÜTUNLAR (TRELLO MANTIĞI) ---
    description = Column(Text, nullable=True) # Görevin detaylı açıklaması
    due_date = Column(DateTime, nullable=True) # Görevin son teslim tarihi (isteğe bağlı)
    # ----------------------------------------------
    
    # İlişki: Görevin ait olduğu proje
    project_id = Column(Integer, ForeignKey("projects.id"))
    project = relationship("Project", back_populates="tasks")
    
    # İlişki: Görevin atandığı çalışan
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Görev ilk başta atanmamış olabilir
    assignee = relationship("User", back_populates="tasks")