import api from './api'; // Yeni oluşturduğumuz instance

// Not: API_URL ve token ekleme işlemleri artık 'api.js' içinde otomatik yapılıyor.

const getProjects = async () => {
    const response = await api.get('/api/projects');
    return response.data;
};

const createProject = async (name, description) => {
    const response = await api.post('/api/projects', { name, description });
    return response.data;
};

const getProjectById = async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}`);
    return response.data;
};

const addMemberToProject = async (projectId, inviteData) => {
    // inviteData: { email, role }
    const response = await api.post(`/api/projects/${projectId}/members`, inviteData);
    return response.data; 
};

const updateProject = async (projectId, projectData) => {
    const response = await api.put(`/api/projects/${projectId}`, projectData);
    return response.data; 
};

const deleteProject = async (projectId) => {
    const response = await api.delete(`/api/projects/${projectId}`);
    return response.data; 
};

const updateMemberRole = async (projectId, memberId, newRole) => {
    const response = await api.put(`/api/projects/${projectId}/members/${memberId}`, { role: newRole });
    return response.data; 
};

const removeMember = async (projectId, memberId) => {
    const response = await api.delete(`/api/projects/${projectId}/members/${memberId}`);
    return response.data; 
};

const analyzeProject = async (projectId) => {
    const response = await api.post(`/api/projects/${projectId}/analyze`, {});
    return response.data; 
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
    analyzeProject, 
};