import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// HATA DÜZELTMESİ: vite.config.js'te tanımladığımız '@/' alias'ını kullanıyoruz
import authService from '@/services/authService';
import taskService from '@/services/taskService'; // Az önce güncellediğimiz servis

/**
 * Bu bileşen 4 prop (komut) alır:
 * - show: (true/false) Modal'ın görünüp görünmeyeceği
 * - onClose: (fonksiyon) "İptal" butonuna basıldığında veya dışarı tıklandığında çalışır
 * - onTaskCreated: (fonksiyon) Görev başarıyla oluşturulduğunda çalışır
 * - projectId: (string) Görevin hangi projeye ekleneceğini bilmek için
 */
function NewTaskModal({ show, onClose, onTaskCreated, projectId }) {
    
    // --- State'ler ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(''); // Tarih (string)
    
    const [error, setError] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    // --- Fonksiyonlar ---
    
    // Modalı kapat ve form alanlarını temizle
    const handleClose = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setError(null);
        onClose(); 
    };

    /**
     * Form gönderildiğinde (Oluştur'a basıldığında) çalışır.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Görev başlığı zorunludur.");
            return;
        }
        setIsLoading(true);

        // Backend'e gönderilecek veriyi hazırla
        const taskData = {
            title: title,
            description: description || null, // Boşsa null gönder
            // Eğer tarih seçilmediyse (boş string "" ise) null gönder,
            // seçildiyse ("2025-10-31" gibi) o string'i gönder.
            due_date: dueDate || null 
        };

        try {
            // Servisi çağır (hangi projeye, hangi veriyle)
            await taskService.createTask(projectId, taskData);
            
            onTaskCreated(); // Ana sayfaya (ProjectDetailPage) haber ver
            handleClose();   // Modalı kapat ve temizle

        } catch (err) {
            console.error("Görev oluşturma hatası:", err);
            
            // 401 (Token süresi doldu) hatası
            if (err.response && err.response.status === 401) {
                authService.logout(); 
                handleClose();        
                navigate('/login');   
            } else {
                // Diğer hatalar (örn: 500, 403)
                setError(err.response?.data?.detail || "Görev oluşturulamadı. Lütfen tekrar deneyin.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    // --- Gösterim (Render) ---
    if (!show) {
        return null; // 'show' prop'u false ise modalı render etme (gösterme)
    }

    // Stitch'ten gelen HTML, JSX'e dönüştürüldü (class -> className, for -> htmlFor vb.)
    return (
        // Modal Overlay (Dışarı tıklayınca kapat)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70"
            onClick={handleClose} 
        >
            {/* Modal Kartı (İçeriye tıklayınca kapatma) */}
            <div 
                className="relative flex w-full max-w-lg flex-col gap-4 rounded-xl bg-white dark:bg-background-dark p-6 sm:p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            >
                <h2 className="text-[#141118] dark:text-white tracking-light text-[32px] font-bold leading-tight">
                    Yeni Görev Oluştur
                </h2>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* Görev Başlığı */}
                    <label className="flex flex-col flex-1 min-w-40">
                        <p className="text-[#141118] dark:text-gray-300 text-base font-medium leading-normal pb-2">Görev Başlığı</p>
                        <div className="group flex w-full flex-1 items-stretch rounded-lg border border-[#e0dbe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-200">
                            <div className="text-[#755f8c] dark:text-gray-400 flex items-center justify-center pl-[15px] border-r border-[#e0dbe6] dark:border-gray-700 pr-2 group-focus-within:text-primary">
                                <span className="material-symbols-outlined">task_alt</span>
                            </div>
                            <input 
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#141118] dark:text-white focus:outline-0 focus:ring-0 border-0 bg-transparent h-14 placeholder:text-[#755f8c] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal" 
                                placeholder="Görev Başlığı" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </label>
                    
                    {/* Açıklama */}
                    <label className="flex flex-col flex-1 min-w-40">
                        <p className="text-[#141118] dark:text-gray-300 text-base font-medium leading-normal pb-2">Açıklama (opsiyonel)</p>
                        <div className="group flex w-full flex-1 items-stretch rounded-lg border border-[#e0dbe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-200">
                            <div className="text-[#755f8c] dark:text-gray-400 flex items-start pt-[15px] justify-center pl-[15px] border-r border-[#e0dbe6] dark:border-gray-700 pr-2 group-focus-within:text-primary">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <textarea 
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#141118] dark:text-white focus:outline-0 focus:ring-0 border-0 bg-transparent min-h-36 placeholder:text-[#755f8c] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal" 
                                placeholder="Görevinizle ilgili daha fazla ayrıntı ekleyin..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                    </label>

                    {/* Son Teslim Tarihi */}
                    <label className="flex flex-col flex-1 min-w-40">
                        <p className="text-[#141118] dark:text-gray-300 text-base font-medium leading-normal pb-2">Son Teslim Tarihi (opsiyonel)</p>
                        <div className="group flex w-full flex-1 items-stretch rounded-lg border border-[#e0dbe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-200">
                            <div className="text-[#755f8c] dark:text-gray-400 flex items-center justify-center pl-[15px] border-r border-[#e0dbe6] dark:border-gray-700 pr-2 group-focus-within:text-primary">
                                <span className="material-symbols-outlined">calendar_today</span>
                            </div>
                            <input 
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#141118] dark:text-white focus:outline-0 focus:ring-0 border-0 bg-transparent h-14 placeholder:text-[#755f8c] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal" 
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    {/* Hata Mesajı Alanı */}
                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}
                    
                    {/* Buton Grubu */}
                    <div className="flex justify-end pt-4">
                        <div className="flex flex-1 gap-3 flex-wrap justify-end sm:flex-none">
                            <button 
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#f2f0f5] dark:bg-white/10 text-[#141118] dark:text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-200"
                                type="button" // Formu göndermemesi için
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                <span className="truncate">İptal</span>
                            </button>
                            <button 
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors duration-200 shadow-md shadow-primary/30 disabled:opacity-70"
                                type="submit"
                                disabled={isLoading}
                            >
                                <span className="truncate">{isLoading ? "Oluşturuluyor..." : "Oluştur"}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewTaskModal;

