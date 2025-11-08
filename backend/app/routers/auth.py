from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta 

# Adım 3.1'de güncellediğimiz şemalar
from app.schemas.user_schemas import UserCreate, UserDisplay, Token

# Adım 3.2'de güncellediğimiz servisler
from app.services.auth_service import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Veritabanı ve Model
from app.database import get_db
from app.models.user_model import User 

router = APIRouter(
    prefix="/api/auth", 
    tags=["Auth"]
)

# YARDIMCI FONKSİYON (Değişmedi)
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# --- REGISTER ENDPOINT (DEĞİŞTİ) ---
@router.post("/register", response_model=UserDisplay)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Kullanıcı kaydı. Artık 'role' almaz. Herkes eşit olarak kaydolur.
    """
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email adresi zaten kullanımda."
        )
    
    hashed_password = get_password_hash(user.password)
    
    # 'role' parametresi kaldırıldı
    db_user = User(
        email=user.email, 
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

# --- LOGIN ENDPOINT (DEĞİŞTİ) ---
@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    user = get_user_by_email(db, email=form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı email veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token süresi
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Token'ın içine koyduğumuz 'data' (payload) değişti.
    # Artık 'role' yok, onun yerine 'id' ekliyoruz (sonraki adımlarda çok işimize yarayacak).
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}