import api from './api';

const getNotifications = async () => {
    // DÜZELTİLDİ: Sonuna / eklendi
    const response = await api.get('/api/notifications/');
    return response.data;
};

const markRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
};

const markAllRead = async () => {
    await api.put('/api/notifications/read-all');
};

export default {
    getNotifications,
    markRead,
    markAllRead
};