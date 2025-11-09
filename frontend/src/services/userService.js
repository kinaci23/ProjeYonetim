import axios from 'axios';
// Proje yapımızla tutarlı olarak authService'i import ediyoruz
import authService from './authService'; 

// API adresimiz
const API_URL = 'http://127.0.0.1:8000';

/**
 * Giriş yapmış kullanıcının profil bilgilerini (id, email, first_name, last_name, title)
 * backend'den (/api/users/me) çeker.
 */
const getProfile = async () => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.get(
        `${API_URL}/api/users/me`, // Adım 4'te oluşturduğumuz GET endpoint'i
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // Kullanıcı verisini döndürür
};

/**
 * Kullanıcının profil bilgilerini (isim, soyisim, unvan) günceller.
 * @param {object} profileData - { first_name, last_name, title }
 */
const updateProfile = async (profileData) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.put(
        `${API_URL}/api/users/me`, // Adım 4'te oluşturduğumuz PUT endpoint'i
        profileData, // { first_name: "Yeni Ad" }
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // Güncellenmiş kullanıcı verisini döndürür
};

// Fonksiyonları dışa aktarıyoruz
export default {
    getProfile,
    updateProfile
};