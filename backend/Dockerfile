# 1. Python 3.10 tabanlı hafif bir imaj kullan
FROM python:3.10-slim

# 2. Çalışma dizinini ayarla
WORKDIR /app

# 3. Gerekli sistem araçlarını yükle (PostgreSQL için gerekebilir)
RUN apt-get update && apt-get install -y libpq-dev gcc

# 4. Kütüphane listesini kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Tüm backend kodlarını kopyala
COPY . .

# 6. Uygulamanın çalışacağı portu belirt (Render genelde 10000 kullanır ama biz env'den alırız)
EXPOSE 8000

# 7. Başlatma komutu (Migration + Uygulama Başlatma)
# Not: Prodüksiyonda migration'ı buraya koymak pratik bir çözümdür.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]