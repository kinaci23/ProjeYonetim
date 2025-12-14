import axios from 'axios';

// API Adresi
const API_URL = 'http://127.0.0.1:8000';

// Axios örneği oluştur
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR (İstek Atılmadan Önce) ---
api.interceptors.request.use(
    (config) => {
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem('userToken');
        
        // Eğer token varsa, header'a ekle
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR (Yanıt Geldikten Sonra) ---
api.interceptors.response.use(
    (response) => {
        // Başarılı yanıtları olduğu gibi döndür
        return response;
    },
    (error) => {
        // Eğer hata 401 (Yetkisiz) ise
        if (error.response && error.response.status === 401) {
            console.warn("Oturum süresi doldu. Çıkış yapılıyor...");
            
            // Token'ları temizle
            localStorage.removeItem('userToken');
            localStorage.removeItem('userId');
            
            // Kullanıcıyı Login sayfasına yönlendir (Sayfayı yenileyerek)
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;