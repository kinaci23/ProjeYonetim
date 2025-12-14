import os
import json
from datetime import datetime # Tarih hesabı için gerekli
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

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
        
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash" 

    def _prepare_project_data(self, db: Session, project_id: int) -> str:
        """
        Veriyi hazırlarken GECİKME durumunu Python tarafında hesaplayıp
        AI'a net bilgi (True/False) olarak gönderiyoruz.
        """
        # 1. Proje
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
                # Rolü de ekliyoruz ki kim yönetici bilsin
                member_list.append(f"{full_name} ({m.role})")
                user_map[user.id] = full_name

        # 3. Görevler ve Gecikme Hesabı
        tasks = db.query(Task).filter(Task.project_id == project_id).all()
        task_list = []
        
        now = datetime.now() # Şu anki zaman

        for t in tasks:
            assignee = user_map.get(t.assignee_id, "Atanmamış")
            
            # Gecikme Mantığı: Status tamamlanmadıysa VE due_date geçmişse
            is_overdue = False
            if t.due_date and t.status != "tamamlandı" and t.due_date < now:
                is_overdue = True

            task_list.append({
                "baslik": t.title,
                "durum": t.status, 
                "atanan_kisi": assignee,
                "aciklama": t.description or "Yok",
                "son_tarih": str(t.due_date) if t.due_date else "Yok",
                "GECIKMIS_MI": "EVET" if is_overdue else "HAYIR" # AI için büyük harfle işaret
            })

        # 4. JSON
        data_summary = {
            "proje_adi": project.name,
            "aciklama": project.description,
            "bugunun_tarihi": str(now.strftime("%Y-%m-%d")), # AI'a bugünü de söylüyoruz
            "uyeler": member_list,
            "gorevler": task_list
        }
        
        return json.dumps(data_summary, ensure_ascii=False, indent=2)

    def analyze_project(self, db: Session, project_id: int) -> ProjectAnalysis:
        project_data_json = self._prepare_project_data(db, project_id)
        
        # --- Prompt Güncellendi: Üye Analizi ve Gecikme Vurgusu ---
        prompt = f"""
        Sen profesyonel bir Proje Yöneticisisin. Aşağıdaki JSON verilerini analiz et.
        
        VERİLER:
        {project_data_json}
        
        GÖREVİN:
        1. Projenin durumunu özetle (Summary). 
           - Özellikle "GECIKMIS_MI": "EVET" olan görevleri tespit et ve bunları raporda mutlaka belirt.
           - Ekip üyelerinin iş yükünü analiz et. Kimin üzerinde kaç görev var? Dengesizlik var mı? (Örn: "Ahmet'in üzerinde çok iş varken Mehmet boşta.")
           - "Atanmamış" görevler varsa risk olarak belirt.

        2. Yöneticiye 3-5 adet somut aksiyon önerisi ver (Recommendations).
           - Gecikmiş görevler için ne yapılmalı?
           - İş yükü dağılımı için ne yapılmalı?
        
        DİL: Türkçe
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
            raise e

ai_service = AIService()