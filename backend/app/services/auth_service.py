import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
# 'Path' (URL'den 'project_id' almak için) import edildi
from fastapi import Depends, HTTPException, status, Path 
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User 
# Yeni modeller import edildi
from app.models.project_member_model import ProjectMember, ProjectRole

# .env dosyasındaki değişkenleri yükle
load_dotenv() 

# --- .env Ayarları (Değişmedi) ---
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES_STR = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

if not all([SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES_STR]):
    raise Exception("Gerekli .env değişkenleri (SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES) ayarlanmamış.")

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES_STR)
except ValueError:
    raise Exception("ACCESS_TOKEN_EXPIRE_MINUTES .env dosyasında bir sayı olmalıdır.")


# --- Şifreleme Ayarları (Değişmedi) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# --- JWT (Token) Oluşturma (Değişmedi) ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- GÜVENLİK (DEPENDENCY) BÖLÜMÜ ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Token'ı çözer, kullanıcıyı DB'den alır ve döndürür.
    (Bu fonksiyon değişmedi)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub") 
        if email is None:
            raise credentials_exception
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception

# -----------------------------------------------------------------
# YENİ EKLENEN BÖLÜM (PROJE BAZLI YETKİLER)
# -----------------------------------------------------------------

def get_project_membership(
    project_id: int = Path(..., title="Proje ID"), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
) -> ProjectMember:
    """
    Kullanıcının belirtilen projeye üye olup olmadığını kontrol eder.
    (project_id'yi URL path'inden alır)
    Eğer üye ise, üyelik (ProjectMember) nesnesini döndürür.
    Eğer üye değilse, 403 Forbidden hatası verir.
    
    Bu, "sadece proje üyelerinin" erişebileceği endpoint'ler için kullanılır.
    """
    
    # ProjectMember tablosunda (proje_id, user_id) çiftini ara
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu projeye erişim yetkiniz yok."
        )
    
    return membership

def get_project_admin(
    membership: ProjectMember = Depends(get_project_membership)
) -> ProjectMember:
    """
    Kullanıcının o projedeki rolünün 'admin' olup olmadığını kontrol eder.
    (Zaten get_project_membership'i çağırarak üye olduğunu varsayar)
    
    Bu, "sadece proje adminlerinin" erişebileceği endpoint'ler için kullanılır
    (örn: üye ekleme, proje ayarları).
    """
    
    if membership.role != ProjectRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlemi yapmak için proje admini olmalısınız."
        )
    
    return membership