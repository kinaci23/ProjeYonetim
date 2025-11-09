import axios from 'axios';
// Proje yapımızla tutarlı olarak authService'i import ediyoruz
import authService from './authService'; 

// API adresimiz
const API_URL = 'http://127.0.0.1:8000';

/**
 * Giriş yapmış kullanıcının TÜM notlarını çeker.
 * (GET /api/notes/)
 */
const getAllNotes = async () => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.get(
        `${API_URL}/api/notes`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // Not listesini (array) döndürür
};

/**
 * Yeni bir not oluşturur. (Boş bile olsa)
 * (POST /api/notes/)
 * @param {object} noteData - { title, content } (İkisi de opsiyonel)
 */
const createNote = async (noteData = {}) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.post(
        `${API_URL}/api/notes`,
        noteData, // { title: "Başlık" } veya {}
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // Yeni oluşturulan notu döndürür
};

/**
 * Belirli bir notu günceller (başlık veya içerik).
 * (PUT /api/notes/{noteId})
 * @param {string|number} noteId - Güncellenecek notun ID'si
 * @param {object} noteData - { title, content } (Sadece güncellenen alanlar)
 */
const updateNote = async (noteId, noteData) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.put(
        `${API_URL}/api/notes/${noteId}`,
        noteData, // { title: "Yeni Başlık" }
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // Güncellenmiş notu döndürür
};

/**
 * Belirli bir notu siler.
 * (DELETE /api/notes/{noteId})
 * @param {string|number} noteId - Silinecek notun ID'si
 */
const deleteNote = async (noteId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.delete(
        `${API_URL}/api/notes/${noteId}`,
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // 204 No Content için boş dönecek
};

// Fonksiyonları dışa aktarıyoruz
export default {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
};