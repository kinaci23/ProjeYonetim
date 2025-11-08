import axios from 'axios';
// Çalışan import yöntemimiz: './' (aynı klasör) ve '.js' uzantısı
import authService from './authService.js'; 

const API_URL = 'http://127.0.0.1:8000';

/**
 * Bir projedeki TÜM görevleri çeker. (Mevcut kod)
 */
const getTasksForProject = async (projectId) => {
    const token = authService.getCurrentToken();
    if (!token) {
        throw new Error("Kullanıcı giriş yapmamış. (Token bulunamadı)");
    }

    const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/tasks`, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data;
};

/**
 * Belirli bir projeye yeni bir görev oluşturur. (Mevcut kod)
 */
const createTask = async (projectId, taskData) => {
    const token = authService.getCurrentToken();
    if (!token) {
        throw new Error("Kullanıcı giriş yapmamış. (Token bulunamadı)");
    }

    const response = await axios.post(
        `${API_URL}/api/projects/${projectId}/tasks`, 
        taskData, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

/**
 * Bir görevin durumunu (status) günceller. (Sürükle-Bırak) (Mevcut kod)
 */
const updateTaskStatus = async (taskId, newStatus) => {
    const token = authService.getCurrentToken();
    if (!token) {
        throw new Error("Kullanıcı giriş yapmamış. (Token bulunamadı)");
    }
    const body = { status: newStatus };
    const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}/status`, 
        body, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

// --- YENİ EKLENEN FONKSİYON 1 (ADIM 6.2) ---
/**
 * ID ile tek bir görevin detaylarını çeker.
 * @param {string|number} taskId - Detayı istenen görevin ID'si
 */
const getTaskById = async (taskId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");
    
    const response = await axios.get(
        `${API_URL}/api/tasks/${taskId}`, // Backend'deki (tasks.py) yeni endpoint
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data;
};

// --- YENİ EKLENEN FONKSİYON 2 (ADIM 6.2) ---
/**
 * Bir görevin detaylarını (başlık, açıklama vb.) günceller.
 * @param {string|number} taskId - Güncellenecek görevin ID'si
 * @param {object} taskData - { title, description, due_date, assignee_id }
 */
const updateTaskDetails = async (taskId, taskData) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.put(
        `${API_URL}/api/tasks/${taskId}`, // Backend'deki (tasks.py) yeni endpoint
        taskData, // { title: "Yeni Başlık" }
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data;
};

// --- YENİ EKLENEN FONKSİYON 3 (ADIM 6.2) ---
/**
 * Bir görevi ID ile siler.
 * @param {string|number} taskId - Silinecek görevin ID'si
 */
const deleteTask = async (taskId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.delete(
        `${API_URL}/api/tasks/${taskId}`, // Backend'deki (tasks.py) yeni endpoint
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // 204 No Content için boş dönecek
};
// ----------------------------------------

// Bu fonksiyonları dışa aktarıyoruz
export default {
    getTasksForProject,
    createTask,
    updateTaskStatus,
    getTaskById,      // <-- Yeni eklendi
    updateTaskDetails,// <-- Yeni eklendi
    deleteTask,       // <-- Yeni eklendi
};