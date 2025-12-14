import api from './api';

const getAllNotes = async () => {
    const response = await api.get('/api/notes');
    return response.data;
};

const createNote = async (noteData = {}) => {
    const response = await api.post('/api/notes', noteData);
    return response.data;
};

const updateNote = async (noteId, noteData) => {
    const response = await api.put(`/api/notes/${noteId}`, noteData);
    return response.data;
};

const deleteNote = async (noteId) => {
    const response = await api.delete(`/api/notes/${noteId}`);
    return response.data;
};

export default {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
};