import api from './api';

const getProfile = async () => {
    const response = await api.get('/api/users/me');
    return response.data; 
};

const updateProfile = async (profileData) => {
    const response = await api.put('/api/users/me', profileData);
    return response.data; 
};

export default {
    getProfile,
    updateProfile
};