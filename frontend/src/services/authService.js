// frontend/src/services/authService.js

import axios from 'axios';

// Backend API'mizin temel adresi. 
const API_URL = 'http://127.0.0.1:8000';

const login = async (email, password) => {
    // Login endpoint'i (OAuth2) bizden form verisi bekliyordu.
    const params = new URLSearchParams();
    params.append('username', email); 
    params.append('password', password);

    const response = await axios.post(
        `${API_URL}/api/auth/login`, 
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    if (response.data.access_token) {
        localStorage.setItem('userToken', response.data.access_token);
    }
    return response.data;
};

// --- YENİ EKLENEN FONKSİYON ---
const register = async (email, password) => {
    // Register endpoint'i Pydantic modeli (UserCreate) kullandığı için
    // bizden form verisi değil, JSON verisi bekler.
    
    // Not: Backend'deki Pydantic şemamız (UserCreate)
    // 'role' alanı gönderilmezse otomatik olarak 'çalışan'
    // varsayılan rolünü atayacaktır. Bu, güvenlik için istediğimiz bir şeydir.
    const response = await axios.post(
        `${API_URL}/api/auth/register`, 
        {
            email: email,
            password: password
            // rol göndermiyoruz, default 'çalışan' olacak
        }
    );
    
    // Dönen veriyi (oluşturulan kullanıcı) döndür
    return response.data; 
};
// ---------------------------------

const logout = () => {
    localStorage.removeItem('userToken');
};

const getCurrentToken = () => {
    return localStorage.getItem('userToken');
};

// Yeni 'register' fonksiyonunu da dışa aktarıyoruz
export default {
    login,
    register, // <-- YENİ
    logout,
    getCurrentToken,
};