from pydantic import BaseModel, Field
from typing import List

# --- AI Çıktı Formatı ---
class ProjectAnalysis(BaseModel):
    """Proje yöneticisine sunulacak gelişmiş analiz raporu."""
    
    summary: str = Field(..., description="Projenin genel durumu, darboğazlar ve başarıların detaylı özeti.")
    
    recommendations: List[str] = Field(..., description="Yöneticinin alması gereken 3-5 adet somut, uygulanabilir aksiyon önerisi.")
    
    # YENİ EKLENEN SKORLAR
    risk_score: int = Field(..., description="Projenin başarısız olma riski (0-100 arası). 0: Risk Yok, 100: Proje Batıyor.")
    
    performance_score: int = Field(..., description="Takımın genel verimlilik ve hız puanı (0-100 arası).")
    
    sentiment: str = Field(..., description="Projenin genel havası: 'Pozitif', 'Nötr' veya 'Negatif'.")

# --- API Yanıt Formatı ---
class AnalysisResponse(BaseModel):
    project_id: int
    analysis: ProjectAnalysis