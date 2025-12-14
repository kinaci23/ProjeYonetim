import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

# Modellerimiz
from app.models.project_model import Project
from app.models.task_model import Task
from app.models.project_member_model import ProjectMember
from app.models.user_model import User
from app.schemas.analysis_schemas import ProjectAnalysis

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY ortam değişkeni bulunamadı.")
        
        # Google GenAI Client
        self.client = genai.Client(api_key=self.api_key)
        # Modeli 2.0 Flash olarak güncelledik, daha hızlı ve akıllı
        self.model_name = "gemini-2.5-flash" 

    def _prepare_project_data(self, db: Session, project_id: int) -> str:
        """
        AI'a gönderilecek veriyi hazırlar. 
        Artık Puan, Öncelik ve Kategori bilgilerini de içeriyor.
        """
        # 1. Proje Bilgisi
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Proje ID {project_id} bulunamadı.")

        # 2. Üyeler
        members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
        member_list = []
        user_map = {}
        
        for m in members:
            user = db.query(User).filter(User.id == m.user_id).first()
            if user:
                full_name = f"{user.first_name} {user.last_name}" if user.first_name else user.email
                member_list.append(f"{full_name} ({m.role})")
                user_map[user.id] = full_name

        # 3. Görevler ve Detaylı Analiz Verileri
        tasks = db.query(Task).filter(Task.project_id == project_id).all()
        task_list = []
        
        now = datetime.now()
        
        total_story_points = 0
        completed_story_points = 0

        for t in tasks:
            assignee = user_map.get(t.assignee_id, "Atanmamış")
            
            # Gecikme Kontrolü
            is_overdue = False
            days_overdue = 0
            if t.due_date and t.status != "tamamlandı" and t.due_date < now:
                is_overdue = True
                days_overdue = (now - t.due_date).days

            # Puan Hesabı
            points = t.story_points or 1
            total_story_points += points
            if t.status == "tamamlandı":
                completed_story_points += points

            task_list.append({
                "baslik": t.title,
                "durum": t.status,
                "oncelik": t.priority,   # YENİ VERİ
                "kategori": t.category,  # YENİ VERİ
                "efor_puani": points,    # YENİ VERİ
                "atanan": assignee,
                "gecikme_durumu": f"{days_overdue} gün gecikti" if is_overdue else "Zamanında",
                "bitis_tarihi": str(t.due_date) if t.due_date else "Yok"
            })

        # 4. JSON Özeti
        data_summary = {
            "proje_adi": project.name,
            "analiz_tarihi": str(now.strftime("%Y-%m-%d")),
            "toplam_is_yuku_puani": total_story_points,
            "tamamlanan_is_yuku_puani": completed_story_points,
            "ekip_uyeleri": member_list,
            "gorev_detaylari": task_list
        }
        
        return json.dumps(data_summary, ensure_ascii=False, indent=2)

    def analyze_project(self, db: Session, project_id: int) -> ProjectAnalysis:
        project_data_json = self._prepare_project_data(db, project_id)
        
        # --- GELİŞMİŞ PROMPT (YENİ VERİLERE GÖRE) ---
        prompt = f"""
        Sen uzman bir Agile Proje Koçu ve Veri Analistisin. Aşağıdaki proje verilerini analiz et.

        VERİLER:
        {project_data_json}

        GÖREVLERİN:
        1. **Risk Skoru Hesapla (0-100):** - 'Kritik' öncelikli ve gecikmiş görevler puanı ciddi oranda yükseltir.
           - Atanmamış görevler risktir.
           - 0 = Mükemmel, 100 = Felaket.
        
        2. **Performans Skoru Hesapla (0-100):**
           - Tamamlanan 'efor_puani' (story points) oranına bak.
           - Ekip üyelerinin iş yükü dengesine bak.
        
        3. **Özet (Summary):**
           - Durumu teknik bir dille özetle. Hangi kategoride (Frontend, Backend vb.) yığılma var?
           - "Ahmet Frontend tarafında darboğaz yaşıyor" gibi spesifik tespitler yap.
        
        4. **Öneriler (Recommendations):**
           - Yöneticinin hemen yapması gereken 3 stratejik hamle söyle.
        
        5. **Sentiment:** Projenin genel havası (Pozitif, Nötr, Negatif).

        YANIT FORMATI: Sadece JSON döndür.
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ProjectAnalysis
                )
            )
            return response.parsed

        except Exception as e:
            print(f"AI Analiz Hatası: {e}")
            # Frontend çökmesin diye varsayılan bir obje dönüyoruz
            return ProjectAnalysis(
                summary="Yapay zeka servisine şu an ulaşılamıyor. Lütfen API anahtarınızı kontrol edin.",
                recommendations=["Bağlantınızı kontrol edin.", "API anahtarını doğrulayın."],
                risk_score=0,
                performance_score=0,
                sentiment="Nötr"
            )

ai_service = AIService()