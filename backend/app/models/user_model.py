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
    
    # --- Profil Alanları ---
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    title = Column(String, nullable=True) 
    
    # İlişkiler:
    
    # 1. Bu kullanıcının atandığı görevler
    tasks = relationship("Task", back_populates="assignee")
    
    # 2. Bu kullanıcının proje üyelikleri
    project_memberships = relationship("ProjectMember", back_populates="user")

    # --- YENİ EKLENEN İLİŞKİ (NOTLAR) ---
    # 3. Bu kullanıcının sahip olduğu notlar
    # (Kullanıcı silinirse, notları da silinsin -> cascade)
    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")

    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")