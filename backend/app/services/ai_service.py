import os
import json
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

# Modellerimiz
from app.models.project_model import Project
from app.models.task_model import Task
from app.models.project_member_model import ProjectMember
from app.models.user_model import User
# Şemamız (AI'ın bu formatta yanıt vermesini isteyeceğiz)
from app.schemas.analysis_schemas import ProjectAnalysis

class AIService:
    def __init__(self):
        # API anahtarını kontrol et
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY ortam değişkeni bulunamadı. Lütfen .env dosyanızı kontrol edin.")
        
        # Gemini istemcisini başlat
        self.client = genai.Client(api_key=self.api_key)
        # Hızlı ve ekonomik model
        self.model_name = "gemini-2.0-flash" 

    def _prepare_project_data(self, db: Session, project_id: int) -> str:
        """
        Veritabanından proje, görev ve üye verilerini çeker
        ve LLM'e gönderilecek bir JSON metni hazırlar.
        """
        # 1. Proje Bilgisi
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Proje ID {project_id} bulunamadı.")

        # 2. Üyeler ve İsimleri
        members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
        member_list = []
        user_map = {} # ID -> İsim eşleşmesi için
        
        for m in members:
            user = db.query(User).filter(User.id == m.user_id).first()
            if user:
                full_name = f"{user.first_name} {user.last_name}" if user.first_name else user.email
                member_list.append(f"{full_name} ({m.role})")
                user_map[user.id] = full_name

        # 3. Görevler
        tasks = db.query(Task).filter(Task.project_id == project_id).all()
        task_list = []
        for t in tasks:
            assignee = user_map.get(t.assignee_id, "Atanmamış")
            task_list.append({
                "baslik": t.title,
                "durum": t.status, # beklemede, yapılıyor, tamamlandı
                "atanan_kisi": assignee,
                "aciklama": t.description or "Yok",
                "son_tarih": str(t.due_date) if t.due_date else "Yok"
            })

        # 4. Veriyi JSON formatına çevir
        data_summary = {
            "proje_adi": project.name,
            "aciklama": project.description,
            "uyeler": member_list,
            "gorevler": task_list
        }
        
        return json.dumps(data_summary, ensure_ascii=False, indent=2)

    def analyze_project(self, db: Session, project_id: int) -> ProjectAnalysis:
        """
        Gemini API'ye proje verilerini gönderir ve yapılandırılmış analiz alır.
        """
        # Veriyi hazırla
        project_data_json = self._prepare_project_data(db, project_id)
        
        prompt = f"""
        Aşağıdaki proje verilerini analiz et. Bir proje yöneticisi gibi davran.
        
        VERİLER:
        {project_data_json}
        
        GÖREVİN:
        1. Projenin genel durumu hakkında kısa ve net bir özet çıkar. Riskleri veya gecikmeleri belirt.
        2. Proje yöneticisine (Admin) yardımcı olacak 3 ile 5 arası somut, uygulanabilir öneri sun.
        
        Yanıtı Türkçe olarak ve belirtilen JSON şemasına uygun ver.
        """

        try:
            # Gemini'ye istek at (Structured Output kullanarak)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ProjectAnalysis # Pydantic modelini doğrudan veriyoruz!
                )
            )
            
            # Gelen JSON yanıtını Pydantic modeline çevir
            return response.parsed

        except Exception as e:
            print(f"AI Analiz Hatası: {e}")
            # Hata durumunda boş/hata mesajı dönmek yerine hatayı fırlatıp router'da yakalayacağız
            raise e

# Servis örneğini oluştur (Dependency Injection için kullanılacak)
ai_service = AIService()