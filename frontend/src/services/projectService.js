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

/**
 * Bir üyenin projedeki rolünü günceller (admin/member).
 */
const updateMemberRole = async (projectId, memberId, newRole) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.put(
        `${API_URL}/api/projects/${projectId}/members/${memberId}`, 
        { role: newRole }, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

/**
 * Bir üyeyi projeden kaldırır.
 */
const removeMember = async (projectId, memberId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.delete(
        `${API_URL}/api/projects/${projectId}/members/${memberId}`, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; 
};

// --- YENİ EKLENEN FONKSİYON (AI Analizi İçin) ---
const analyzeProject = async (projectId) => {
    const token = authService.getCurrentToken();
    if (!token) throw new Error("Kullanıcı giriş yapmamış.");

    const response = await axios.post(
        `${API_URL}/api/projects/${projectId}/analyze`,
        {}, // Body boş gidebilir, parametreler URL'de
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
    );
    return response.data; // { project_id: 1, analysis: { summary: "...", recommendations: [...] } }
};

export default {
    getProjects,
    createProject,
    getProjectById,
    addMemberToProject,
    updateProject, 
    deleteProject,
    updateMemberRole,
    removeMember,
    analyzeProject, // <-- Yeni eklenen fonksiyon dışa aktarıldı
};