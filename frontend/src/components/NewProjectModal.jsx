import React, { useState } from 'react';
// YENİ IMPORT'LAR:
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // Token'ı temizlemek (logout) için
import projectService from '../services/projectService'; 

function NewProjectModal({ show, onClose, onProjectCreated }) {
    
    // --- State'ler ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); 

    // YENİ: Yönlendirme için
    const navigate = useNavigate();

    // --- Fonksiyonlar ---
    
    const handleClose = () => {
        setName('');
        setDescription('');
        setError(null);
        onClose(); 
    };

    /**
     * Form gönderildiğinde (Oluştur'a basıldığında) çalışır.
     * (CATCH BLOĞU GÜNCELLENDİ)
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Proje adı zorunludur.");
            return;
        }
        setIsLoading(true);

        try {
            await projectService.createProject(name, description);
            onProjectCreated(); 
            handleClose();      

        } catch (err) {
            // --- YENİ HATA KONTROLÜ ---
            console.error("Proje oluşturma hatası:", err);
            
            // Hata 401 mi (Token süresi doldu / Yetkisiz)?
            if (err.response && err.response.status === 401) {
                // Hata 401 ise, kullanıcıyı zorla dışarı at ve giriş yapsın
                authService.logout(); // Geçersiz token'ı temizle
                handleClose();        // Modalı kapat
                navigate('/login');   // Giriş sayfasına yönlendir
            } else {
                // Değilse (örn: 400, 500 hatası), backend'den gelen
                // "Proje adı zaten var" gibi spesifik hatayı göster
                setError(err.response?.data?.detail || "Proje oluşturulamadı. Lütfen tekrar deneyin.");
            }
            // --------------------------
        } finally {
            setIsLoading(false); 
        }
    };

    // --- Gösterim (Render) ---
    if (!show) {
        return null;
    }

    return (
        // Modal Overlay
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/60 p-4"
            onClick={handleClose}
        >
            {/* Modal Kartı */}
            <div 
                className="relative flex w-full max-w-lg flex-col gap-6 rounded-xl bg-white dark:bg-background-dark p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            >
                
                {/* Başlık */}
                <h2 className="text-center text-2xl font-bold leading-tight tracking-tight text-[#141118] dark:text-white">
                    Yeni Proje Oluştur
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Proje Adı (Tasarım Düzeltmesi Uygulanmış Hali) */}
                    <label className="flex flex-col flex-1">
                        <p className="pb-2 text-sm font-medium leading-normal text-[#141118] dark:text-gray-200">Proje Adı</p>
                        <div className="relative flex w-full items-stretch">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#755f8c] dark:text-gray-400" style={{fontSize: "24px"}}>
                                business_center
                            </span>
                            <input 
                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#e0dbe6] bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white h-12 p-3 pl-12 pr-2 text-base font-normal leading-normal placeholder:text-[#755f8c] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:focus:border-primary"
                                placeholder="Proje adını girin" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus 
                            />
                        </div>
                    </label>

                    {/* Açıklama */}
                    <label className="flex flex-col flex-1">
                        <p className="pb-2 text-sm font-medium leading-normal text-[#141118] dark:text-gray-200">Açıklama (İsteğe bağlı)</p>
                        <textarea 
                            className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg border border-[#e0dbe6] bg-white dark:bg-background-dark dark:border-gray-700 dark:text-white min-h-32 p-3 text-base font-normal leading-normal placeholder:text-[#755f8c] focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:focus:border-primary" 
                            placeholder="Proje açıklamasını girin"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </label>

                    {/* Hata Mesajı Alanı */}
                    {/* Artık 401 hatası yerine sadece 
                        "Proje adı zorunludur" veya "Proje oluşturulamadı"
                        gibi hataları gösterecek.
                    */}
                    {error && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Buton Grubu */}
                    <div className="mt-2 flex w-full flex-col gap-3">
                        <button 
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform duration-200 hover:scale-105 active:scale-100 disabled:opacity-70"
                            type="submit"
                            disabled={isLoading}
                        >
                            <span className="truncate">{isLoading ? "Oluşturuluyor..." : "Oluştur"}</span>
                        </button>
                        <button 
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 border border-[#e0dbe6] dark:border-gray-700 bg-transparent text-[#141118] dark:text-gray-200 text-base font-bold leading-normal tracking-[0.015em] hover:bg-black/5 dark:hover:bg-white/10"
                            type="button" 
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            <span className="truncate">İptal</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewProjectModal;