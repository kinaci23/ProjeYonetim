import api from './api';

const getTasksForProject = async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}/tasks`);
    return response.data;
};

const createTask = async (projectId, taskData) => {
    const response = await api.post(`/api/projects/${projectId}/tasks`, taskData);
    return response.data; 
};

const updateTaskStatus = async (taskId, newStatus) => {
    const response = await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
    return response.data; 
};

const getTaskById = async (taskId) => {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
};

const updateTaskDetails = async (taskId, taskData) => {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
};

const deleteTask = async (taskId) => {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data; 
};

export default {
    getTasksForProject,
    createTask,
    updateTaskStatus,
    getTaskById,
    updateTaskDetails,
    deleteTask,
};