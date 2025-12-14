import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import taskService from '@/services/taskService';

function NewTaskModal({ show, onClose, onTaskCreated, projectId }) {
    
    // --- State'ler ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // YENİ STATE'LER (Öncelik, Kategori, Puan)
    const [priority, setPriority] = useState('Orta');
    const [category, setCategory] = useState('Diğer');
    const [storyPoints, setStoryPoints] = useState(1);

    const [error, setError] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    // Fibonacci Dizisi
    const fibonacciPoints = [1, 2, 3, 5, 8, 13, 21];

    const handleClose = () => {
        setTitle(''); setDescription(''); setDueDate('');
        setPriority('Orta'); setCategory('Diğer'); setStoryPoints(1);
        setError(null);
        onClose(); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Görev başlığı zorunludur.");
            return;
        }
        setIsLoading(true);

        const taskData = {
            title,
            description: description || null, 
            due_date: dueDate || null,
            // YENİ VERİLER
            priority,
            category,
            story_points: parseInt(storyPoints)
        };

        try {
            await taskService.createTask(projectId, taskData);
            onTaskCreated(); 
            handleClose();   
        } catch (err) {
            console.error("Hata:", err);
            if (err.response && err.response.status === 401) {
                authService.logout(); handleClose(); navigate('/login');   
            } else {
                setError("Görev oluşturulamadı.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    if (!show) return null; 

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="relative w-full max-w-2xl flex-col gap-6 rounded-2xl bg-white dark:bg-[#1A202C] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Görev Kartı</h2>
                    <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-full">AGILE</div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Başlık */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Görev Başlığı</label>
                        <input className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-indigo-500" 
                            placeholder="Örn: Login sayfasını tasarla" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                    </div>

                    {/* Yan Yana 3'lü Seçim: Öncelik - Kategori - Puan */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Öncelik */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">Öncelik</label>
                            <select className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 text-sm"
                                value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="Düşük">🟢 Düşük</option>
                                <option value="Orta">🟡 Orta</option>
                                <option value="Yüksek">🟠 Yüksek</option>
                                <option value="Kritik">🔴 Kritik</option>
                            </select>
                        </div>
                        {/* Kategori */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">Departman</label>
                            <select className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 text-sm"
                                value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Tasarım">Tasarım</option>
                                <option value="Test">Test</option>
                                <option value="DevOps">DevOps</option>
                                <option value="Diğer">Diğer</option>
                            </select>
                        </div>
                        {/* Story Point (Fibonacci) */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">Efor Puanı</label>
                            <div className="flex items-center gap-2">
                                <select className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 text-sm font-mono"
                                    value={storyPoints} onChange={(e) => setStoryPoints(e.target.value)}>
                                    {fibonacciPoints.map(p => <option key={p} value={p}>{p} SP</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Açıklama ve Tarih */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className='md:col-span-2'>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Açıklama</label>
                            <textarea className="form-textarea w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 h-24 text-sm" 
                                placeholder="Detayları girin..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">Son Teslim</label>
                            <input className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 text-sm" 
                                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded text-center">{error}</div>}
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">İptal</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                            {isLoading ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewTaskModal;