from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db

# Modeller ve Şemalar
from app.models.user_model import User
from app.schemas.analysis_schemas import AnalysisResponse

# Güvenlik (Sadece o projenin Admin'i analiz isteyebilir)
from app.services.auth_service import get_project_admin

# Oluşturduğumuz AI Servisi
from app.services.ai_service import ai_service

router = APIRouter(
    prefix="/api",
    tags=["Analysis"],
)

@router.post(
    "/projects/{project_id}/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Proje verilerini yapay zeka ile analiz et"
)
def analyze_project_endpoint(
    project_id: int,
    db: Session = Depends(get_db),
    # KRİTİK GÜVENLİK: Bu satır, isteği yapan kişinin
    # o projede "Admin" olup olmadığını kontrol eder. Değilse 403 hatası fırlatır.
    current_user: User = Depends(get_project_admin)
):
    """
    Belirtilen projenin verilerini (görevler, üyeler, durumlar) toplar,
    Gemini AI servisine gönderir ve yapılandırılmış bir analiz raporu döndürür.
    """
    try:
        # Servisimizi çağırıyoruz (Senkron olduğu için await kullanmıyoruz)
        analysis_result = ai_service.analyze_project(db, project_id)
        
        # Sonucu API formatına uygun döndür
        return AnalysisResponse(
            project_id=project_id,
            analysis=analysis_result
        )

    except ValueError as e:
        # Veri bulunamadı hatası (örn: Proje yok)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        # Genel sunucu veya AI hatası
        print(f"Analiz Endpoint Hatası: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analiz oluşturulurken bir hata meydana geldi."
        )