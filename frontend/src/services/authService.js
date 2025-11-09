import axios from 'axios';
// YENİ IMPORT: Token'ı okumak için
import { jwtDecode } from 'jwt-decode'; 

const API_URL = 'http://127.0.0.1:8000';

/**
 * GİRİŞ FONKSİYONU (GÜNCELLENDİ)
 */
const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email); 
    params.append('password', password);

    const response = await axios.post(
        `${API_URL}/api/auth/login`, 
        params,
        {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
    );

    if (response.data.access_token) {
        // 1. Token'ı kaydet (Mevcut kod)
        localStorage.setItem('userToken', response.data.access_token);
        
        // --- YENİ EKLENEN MANTIK ---
        // 2. Token'ı çöz
        try {
            const decodedToken = jwtDecode(response.data.access_token);
            // 3. Token'ın içindeki 'id'yi (user.id) de kaydet
            // (Backend/auth.py'de 'id'yi eklemiştik)
            if (decodedToken.id) {
                localStorage.setItem('userId', decodedToken.id);
            }
        } catch (error) {
            console.error("Token decode hatası:", error);
        }
        // -------------------------
    }
    return response.data;
};

/**
 * ÇIKIŞ FONKSİYONU (GÜNCELLENDİ)
 */
const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId'); // <-- 'userId'yi de temizle
};

/**
 * Token'ı almak için (Değişmedi)
 */
const getCurrentToken = () => {
    return localStorage.getItem('userToken');
};

// --- YENİ EKLENEN FONKSİYON (HATANIN ÇÖZÜMÜ) ---
/**
 * Mevcut giriş yapmış kullanıcının ID'sini alır.
 */
const getCurrentUserId = () => {
    // ID'yi string olarak döndürür
    return localStorage.getItem('userId'); 
};
// ----------------------------------------

export default {
    login,
    logout,
    getCurrentToken,
    getCurrentUserId, // <-- Yeni fonksiyonu dışa aktar
    // (Register fonksiyonuna gerek yok, login'de ID alıyoruz)
    register: async (email, password) => {
        const response = await axios.post(
            `${API_URL}/api/auth/register`, 
            { email: email, password: password }
        );
        return response.data; 
    }
};