import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Çalışan import yöntemimiz: göreceli yol ve uzantı YOK
import authService from '../services/authService';
import taskService from '../services/taskService'; 

/**
 * Bu bileşen 6 prop alır:
 * - show: (true/false) Modal'ın görünüp görünmeyeceği
 * - onClose: (fonksiyon) Modal kapandığında çalışır
 * - onTaskUpdated: (fonksiyon) Görev başarıyla güncellendiğinde çalışır
 * - onTaskDeleted: (fonksiyon) Görev başarıyla silindiğinde çalışır
 * - taskId: (string) Hangi görevin detaylarının çekileceği
 * - members: (array) Proje üyelerinin listesi (Atanan Kişi dropdown'ı için)
 */
function TaskDetailModal({ show, onClose, onTaskUpdated, onTaskDeleted, taskId, members }) {
    
    // --- State'ler ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(''); 
    const [assigneeId, setAssigneeId] = useState(''); // '' = Atanmamış
    
    const [error, setError] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); // Modal içi yüklemeler (veri çekme, kaydetme, silme)
    const navigate = useNavigate();

    // --- Veri Çekme (useEffect) ---
    // Modal açıldığında (show=true) veya taskId değiştiğinde,
    // görevin en güncel detaylarını API'den çek.
    useEffect(() => {
        // Modal kapalıysa veya ID yoksa bir şey yapma
        if (!show || !taskId) {
            return;
        }

        const fetchTaskDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Adım 6.2'de eklediğimiz yeni servis fonksiyonu
                const task = await taskService.getTaskById(taskId);
                
                // Gelen veriyle form state'lerini doldur
                setTitle(task.title || '');
                setDescription(task.description || '');
                // Tarihi 'YYYY-MM-DD' formatına çevir
                setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                setAssigneeId(task.assignee_id?.toString() || '');

            } catch (err) {
                console.error("Görev detayı çekme hatası:", err);
                if ((err.response && err.response.status === 401) || !err.response) {
                    authService.logout(); navigate('/login');   
                } else {
                    setError("Görev detayları yüklenemedi.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTaskDetails();
    }, [show, taskId, navigate]); // Bu değerler değiştiğinde useEffect'i tekrar çalıştır

    
    // --- Fonksiyonlar ---
    
    // Modalı kapat
    const handleClose = () => {
        setError(null);
        onClose(); // 'selectedTaskId'yi null yapar (ProjectDetailPage'de)
    };

    /**
     * "KAYDET" (Güncelle) Butonuna basıldığında
     */
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Görev başlığı zorunludur.");
            return;
        }
        setIsLoading(true);

        const taskData = {
            title: title,
            description: description || null, 
            due_date: dueDate || null,
            assignee_id: assigneeId ? parseInt(assigneeId, 10) : null 
        };

        try {
            // Adım 6.2'de eklediğimiz yeni servis fonksiyonu
            await taskService.updateTaskDetails(taskId, taskData);
            onTaskUpdated(); // Ana sayfaya (ProjectDetailPage) haber ver
            handleClose();   // Modalı kapat
        } catch (err) {
            console.error("Görev güncelleme hatası:", err);
            if ((err.response && err.response.status === 401)) {
                authService.logout(); navigate('/login');   
            } else {
                setError(err.response?.data?.detail || "Görev güncellenemedi.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    /**
     * "SİL" Butonuna basıldığında (Dün onayladığımız güvenlik kontrolüyle)
     */
    const handleDelete = async () => {
        
        // Kullanıcıya "Emin misin?" diye sor
        if (!window.confirm("Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            return; // 'İptal'e basarsa fonksiyonu durdur
        }

        setIsLoading(true);
        setError(null);

        try {
            // Adım 6.2'de eklediğimiz yeni servis fonksiyonu
            await taskService.deleteTask(taskId);
            onTaskDeleted(); // Ana sayfaya (ProjectDetailPage) haber ver
            handleClose();   // Modalı kapat
        } catch (err) {
             console.error("Görev silme hatası:", err);
            if ((err.response && err.response.status === 401)) {
                authService.logout(); navigate('/login');   
            } else {
                setError(err.response?.data?.detail || "Görev silinemedi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Gösterim (Render) ---
    if (!show) return null; 

    // Stitch'ten gelen HTML, JSX'e dönüştürüldü
    // VE TASARIMI 'NewTaskModal' İLE TUTARLI HALE GETİRİLDİ
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70"
            onClick={handleClose} 
        >
            {/* Modal Kartı (Dışarı tıklamayı engelle) */}
            <div 
                className="relative w-full max-w-2xl rounded-xl bg-white shadow-lg dark:bg-background-dark"
                onClick={(e) => e.stopPropagation()} 
            >
                
                {/* Modal Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Görev Detayları</h3>
                    <button 
                        aria-label="Close modal" 
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" 
                        type="button"
                        onClick={handleClose}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                {/* Yükleniyor... (Eğer modal içinde veri çekiliyorsa) */}
                {isLoading && (
                    <div className="py-20 text-center text-gray-500">Yükleniyor...</div>
                )}
                
                {/* Form (Veri çekme bittikten sonra görünür) */}
                {!isLoading && (
                    <form onSubmit={handleUpdate}>
                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Form Alanları (2 Sütunlu Grid) */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                
                                {/* Görev Başlığı (Tam Genişlik) */}
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="title">Görev Başlığı</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">task_alt</span>
                                        </div>
                                        <input 
                                            className="form-input w-full pl-12 pr-4 py-3 h-14 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                                            id="title" 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Açıklama (Tam Genişlik) */}
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="description">Açıklama</label>
                                    <textarea 
                                        className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-4" 
                                        rows="4"
                                        id="description"
                                        placeholder="Görevinizle ilgili daha fazla ayrıntı ekleyin..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                {/* Son Teslim Tarihi (Yarım Genişlik) */}
                                <div>
                                    <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="due_date">Son Teslim Tarihi</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">calendar_today</span>
                                        </div>
                                        <input 
                                            className="form-input w-full pl-12 pr-4 py-3 h-14 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" 
                                            type="date"
                                            id="due_date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Atanan Kişi (Yarım Genişlik) */}
                                <div>
                                    <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="assignee">Atanan Kişi</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">person_check</span>
                                        </div>
                                        <select 
                                            className="form-select w-full pl-12 pr-4 py-3 h-14 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                            id="assignee"
                                            value={assigneeId}
                                            onChange={(e) => setAssigneeId(e.target.value)}
                                        >
                                            <option value="">Atanmamış</option>
                                            {/* Dashboard'dan (prop) gelen üyeleri listele */}
                                            {members.map(member => (
                                                <option key={member.user.id} value={member.user.id}>
                                                    {member.user.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Hata Mesajı Alanı */}
                                {error && (
                                    <div className="md:col-span-2 rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Modal Footer (Butonlar) */}
                        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                            <button 
                                className="w-full rounded-lg bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 sm:w-auto" 
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                İptal
                            </button>
                            <button 
                                className="w-full rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 sm:w-auto" 
                                type="button" // Formu göndermemesi için
                                onClick={handleDelete} // Silme fonksiyonu
                                disabled={isLoading}
                            >
                                {isLoading ? "Siliniyor..." : "Sil"}
                            </button>
                            <button 
                                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 sm:w-auto" 
                                type="submit" // Formu gönderir (handleUpdate'i tetikler)
                                disabled={isLoading}
                            >
                                {isLoading ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default TaskDetailModal;