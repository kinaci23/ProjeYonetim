import axios from 'axios';
// Çalışan import yöntemi: './' ve uzantı YOK
import authService from './authService'; 

const API_URL = 'http://127.0.0.1:8000';

const getProjects = async () => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");
    const response = await axios.get(`${API_URL}/api/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

const createProject = async (name, description) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");
    const response = await axios.post(`${API_URL}/api/projects`, 
        { name, description },
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
};

const getProjectById = async (projectId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");
    const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

const addMemberToProject = async (projectId, inviteData) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.post(
        `${API_URL}/api/projects/${projectId}/members`, 
        inviteData, // { email, role }
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

const updateProject = async (projectId, projectData) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.put(
        `${API_URL}/api/projects/${projectId}`, 
        projectData, // { name: "Yeni Ad" }
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

const deleteProject = async (projectId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.delete(
        `${API_URL}/api/projects/${projectId}`, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

// --- YENİ EKLENEN FONKSİYON 3 (ADIM 7.2) ---
/**
 * Bir üyenin projedeki rolünü günceller (admin/member).
 * @param {string|number} projectId - Proje ID'si
 * @param {string|number} memberId - Üyeliğin ID'si (user_id DEĞİL, project_members tablosunun ID'si)
 * @param {string} newRole - "admin" veya "member"
 */
const updateMemberRole = async (projectId, memberId, newRole) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.put(
        `${API_URL}/api/projects/${projectId}/members/${memberId}`, // PUT .../members/{member_id}
        { role: newRole }, // Body'de sadece { "role": "admin" }
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // Güncellenmiş üyeliği döndürür
};

// --- YENİ EKLENEN FONKSİYON 4 (ADIM 7.2) ---
/**
 * Bir üyeyi projeden kaldırır.
 * @param {string|number} projectId - Proje ID'si
 * @param {string|number} memberId - Üyeliğin ID'si (project_members tablosunun ID'si)
 */
const removeMember = async (projectId, memberId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.delete(
        `${API_URL}/api/projects/${projectId}/members/${memberId}`, // DELETE .../members/{member_id}
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // 204 No Content için boş dönecek
};
// ----------------------------------------

export default {
    getProjects,
    createProject,
    getProjectById,
    addMemberToProject,
    updateProject, 
    deleteProject,
    updateMemberRole, // <-- Yeni eklendi
    removeMember      // <-- Yeni eklendi
};