# backend/app/models/note_model.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Yeni not oluşturulduğunda varsayılan bir başlık verelim
    title = Column(String, index=True, nullable=False, default="Yeni Not") 
    content = Column(Text, nullable=True) # Notun içeriği (boş olabilir)
    
    # Bu notun SAHİBİ kim? (users.id'ye bağlar)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # İlişki: Bu notun sahibinin (User nesnesi) kim olduğunu belirtir
    owner = relationship("User", back_populates="notes")