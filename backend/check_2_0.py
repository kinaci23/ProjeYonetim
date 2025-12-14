import os
from dotenv import load_dotenv
from google import genai

# .env yükle
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ HATA: API Key bulunamadı! .env dosyasını kontrol et.")
else:
    print(f"✅ API Key bulundu: {api_key[:5]}*******")
    
    try:
        # Yeni SDK Client'ı
        client = genai.Client(api_key=api_key)
        
        print("\n🔍 Hesabının Erişim Yetkisi Olan Modeller Taranıyor...\n")
        
        # Modelleri listele
        found_2_0 = False
        for m in client.models.list():
            # Sadece 'generateContent' yeteneği olanları ve isminde 'gemini' geçenleri filtrele
            if "generateContent" in m.supported_actions:
                print(f"📦 Model: {m.name} | Görünen Ad: {m.display_name}")
                
                if "2.0" in m.name:
                    found_2_0 = True
                    print(f"   ---> ⭐ BULUNDU! Gemini 2.0 modeli tespit edildi: {m.name}")

        if not found_2_0:
            print("\n⚠️ UYARI: Listede '2.0' içeren bir model bulunamadı. Hesabın henüz Gemini 2.0 beta erişimine açık olmayabilir veya bölge kısıtlaması olabilir.")
        else:
            print("\n✅ BAŞARILI: Gemini 2.0 modellerine erişiminiz var.")

    except Exception as e:
        print(f"\n❌ KRİTİK HATA: {e}")