# backend/app/models/project_member_model.py
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Bu projedeki roller (Global değil, proje içi)
class ProjectRole(str, enum.Enum):
    admin = "admin"
    member = "member"

class ProjectMember(Base):
    __tablename__ = "project_members"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Hangi projeye ait? (project.id'ye yabancı anahtar)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Hangi kullanıcıya ait? (users.id'ye yabancı anahtar)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Bu kullanıcının bu projedeki rolü ne?
    role = Column(Enum(ProjectRole), nullable=False, default=ProjectRole.member)
    
    # İlişkiler (Bu kaydın 'user' ve 'project' nesnelerine bağlanması)
    project = relationship("Project", back_populates="memberships")
    user = relationship("User", back_populates="project_memberships")
    
    # Bir kullanıcı bir projeye sadece bir kez eklenebilir olmalı (Veritabanı kısıtlaması)
    __table_args__ = (UniqueConstraint('project_id', 'user_id', name='_project_user_uc'),)