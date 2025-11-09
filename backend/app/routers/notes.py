from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
# 1. GEREKLİ MODELLER
from app.models import user_model, note_model
# 2. GEREKLİ ŞEMALAR
from app.schemas import note_schemas
# 3. GÜVENLİK
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/api/notes",
    tags=["Notes"]
)

# --- YARDIMCI GÜVENLİK FONKSİYONU (Dependency) ---
def get_note_for_user(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
) -> note_model.Note:
    """
    Notu ID ile bulur ve GÜVENLİK KONTROLÜ yapar.
    Not ya bulunamazsa ya da mevcut kullanıcıya ait DEĞİLSE 404 döndürür.
    Bu, kullanıcıların sadece kendi notlarını düzenleyip silebilmesini sağlar.
    """
    note = db.query(note_model.Note).filter(
        note_model.Note.id == note_id,
        note_model.Note.user_id == current_user.id # Sadece GİRİŞ YAPAN KULLANICIYA ait notları ara
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not bulunamadı."
        )
    return note

# --- ENDPOINT 1 (TÜM NOTLARI LİSTELE) ---
@router.get("/", response_model=List[note_schemas.NoteDisplay])
def get_my_notes(
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Giriş yapmış mevcut kullanıcının tüm notlarını listeler.
    user_model.py'deki 'notes' ilişkisi sayesinde bu çok basittir.
    """
    return current_user.notes

# --- ENDPOINT 2 (YENİ NOT OLUŞTUR) ---
@router.post("/", response_model=note_schemas.NoteDisplay, status_code=status.HTTP_201_CREATED)
def create_new_note(
    note_data: note_schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user)
):
    """
    Giriş yapmış kullanıcı için yeni bir not oluşturur.
    note_model.py'de 'title' için "Yeni Not" varsayılan değeri vardır.
    """
    db_note = note_model.Note(
        # 'title' veya 'content' gönderildiyse onları kullan
        **note_data.dict(exclude_unset=True), 
        # Notun sahibini (user_id) mevcut token'dan gelen kullanıcıya ata
        user_id=current_user.id
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

# --- ENDPOINT 3 (NOT GÜNCELLE) ---
@router.put("/{note_id}", response_model=note_schemas.NoteDisplay)
def update_my_note(
    note_data: note_schemas.NoteUpdate,
    # Güvenlik burada: get_note_for_user dependency'si
    # hem notu bulur hem de kullanıcıya ait mi diye kontrol eder
    db_note: note_model.Note = Depends(get_note_for_user), 
    db: Session = Depends(get_db)
):
    """
    Kullanıcının SADECE KENDİNE ait bir notu (başlık veya içerik) günceller.
    """
    # note_data'dan sadece gönderilen alanları (None olmayan) al
    update_data = note_data.dict(exclude_unset=True)

    # (Frontend sadece title gönderdiyse, 'update_data' = {'title': 'Yeni Başlık'})
    # (Frontend sadece content gönderdiyse, 'update_data' = {'content': 'Yeni içerik'})
    
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Güncellenecek veri gönderilmedi.")

    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

# --- ENDPOINT 4 (NOT SİL) ---
@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_note(
    # Güvenlik burada: Notu bul ve sahipliğini kontrol et
    db_note: note_model.Note = Depends(get_note_for_user), 
    db: Session = Depends(get_db)
):
    """
    Kullanıcının SADECE KENDİNE ait bir notu siler.
    """
    db.delete(db_note)
    db.commit()
    return None # 204 status kodu ile boş yanıt döner