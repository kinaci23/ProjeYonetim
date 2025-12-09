from pydantic import BaseModel, Field
from typing import List

# --- AI Çıktı Formatı ---
# Yapay zekadan bu formatta veri isteyeceğiz
class ProjectAnalysis(BaseModel):
    """Proje yöneticisine sunulacak özet ve önerileri içeren yapı."""
    summary: str = Field(..., description="Projenin mevcut durumu, ilerlemesi ve darboğazların kısa özeti.")
    recommendations: List[str] = Field(..., description="Proje yöneticisinin alması gereken 3-5 kritik aksiyon önerisi.")

# --- API Yanıt Formatı ---
# Frontend'e bu formatta yanıt döneceğiz
class AnalysisResponse(BaseModel):
    project_id: int
    analysis: ProjectAnalysis