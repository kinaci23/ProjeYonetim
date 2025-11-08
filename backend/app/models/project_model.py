# backend/app/models/project_model.py
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # 'manager_id' ve 'manager' ilişkisi kaldırıldı.
    
    # İlişkiler:
    
    # 1. Projeye ait görevler (Bu değişmedi)
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    
    # 2. REVİZYON: Bu projenin hangi üyelere sahip olduğunu
    # 'ProjectMember' ara tablosu üzerinden gösteren ilişki.
    memberships = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")