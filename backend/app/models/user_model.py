# backend/app/models/user_model.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

# 'UserRole' enum'unu sildik, artık global role gerek yok.

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # 'role' sütunu kaldırıldı.
    
    # --- YENİ EKLENEN PROFİL SÜTUNLARI ---
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    title = Column(String, nullable=True) # Örn: "Software Developer"
    # -------------------------------------
    
    # İlişkiler:
    
    # 1. Bu kullanıcının atandığı görevler (Bu değişmedi)
    tasks = relationship("Task", back_populates="assignee")
    
    # 2. REVİZYON: Bu kullanıcının hangi projelere üye olduğunu
    # 'ProjectMember' ara tablosu üzerinden gösteren ilişki.
    project_memberships = relationship("ProjectMember", back_populates="user")