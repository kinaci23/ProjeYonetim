from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db

# Modeller ve Şemalar
from app.models.user_model import User
from app.schemas.analysis_schemas import AnalysisResponse

# --- DEĞİŞİKLİK 1: get_project_admin yerine get_project_membership import et ---
# Eski: from app.services.auth_service import get_project_admin
from app.services.auth_service import get_project_membership 

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
    # --- DEĞİŞİKLİK 2: Admin zorunluluğunu kaldır, Üye olmak yetsin ---
    # Eski: current_user: User = Depends(get_project_admin)
    membership = Depends(get_project_membership) 
):
    """
    Belirtilen projenin verilerini (görevler, üyeler, durumlar) toplar,
    Gemini AI servisine gönderir ve yapılandırılmış bir analiz raporu döndürür.
    """
    try:
        # Servisimizi çağırıyoruz
        analysis_result = ai_service.analyze_project(db, project_id)
        
        # Sonucu API formatına uygun döndür
        return AnalysisResponse(
            project_id=project_id,
            analysis=analysis_result
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        print(f"Analiz Endpoint Hatası: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analiz hatası: {str(e)}"
        )