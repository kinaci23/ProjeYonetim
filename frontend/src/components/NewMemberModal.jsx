import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Hata Düzeltmesi: Göreceli yol ('../') yerine '@/' (alias) yolunu kullanıyoruz
import authService from '@/services/authService';
import projectService from '@/services/projectService'; 

/**
 * Bu bileşen 4 prop (komut) alır:
 * - show: (true/false) Modal'ın görünüp görünmeyeceği
 * - onClose: (fonksiyon) "İptal" butonuna basıldığında çalışır
 * - onMemberAdded: (fonksiyon) Üye başarıyla eklendiğinde çalışır
 * - projectId: (string) Üyenin hangi projeye ekleneceğini bilmek için
 */
function NewMemberModal({ show, onClose, onMemberAdded, projectId }) {
    
    // --- State'ler ---
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member'); // Varsayılan rol
    
    const [error, setError] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    // --- Fonksiyonlar ---
    
    const handleClose = () => {
        setEmail('');
        setRole('member'); 
        setError(null);
        onClose(); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError("Email adresi zorunludur.");
            return;
        }
        setIsLoading(true);

        const inviteData = { email: email, role: role };

        try {
            await projectService.addMemberToProject(projectId, inviteData);
            onMemberAdded(); 
            handleClose();   
        } catch (err) {
            console.error("Üye ekleme hatası:", err);
            if (err.response && (err.response.status === 401)) {
                authService.logout(); 
                handleClose();        
                navigate('/login');   
            } else if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                setError(err.response.data.detail); 
            } else {
                setError(err.response?.data?.detail || "Üye eklenemedi. Lütfen tekrar deneyin.");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    // --- Gösterim (Render) ---
    if (!show) return null; 

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleClose} 
        >
            <div 
                className="relative w-full max-w-md rounded-xl bg-white dark:bg-background-dark shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Modal Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projeye Üye Ekle</h3>
                    <button 
                        aria-label="Close modal" 
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" 
                        type="button"
                        onClick={handleClose}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Modal Body */}
                    <div className="p-6 space-y-6">
                        {/* Email Input */}
                        <div className="relative">
                            <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="email">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">mail</span>
                                </div>
                                <input 
                                    className="form-input w-full pl-12 pr-4 py-3 h-14 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                                    id="email" 
                                    placeholder="uye@sirket.com" 
                                    required 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        {/* Rol Seçimi (Dropdown) */}
                        <div>
                            <label className="block mb-2 text-base font-medium text-gray-900 dark:text-gray-200" htmlFor="role">Rol</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">manage_accounts</span>
                                </div>
                                <select 
                                    className="form-select w-full pl-12 pr-4 py-3 h-14 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    id="role"
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)} 
                                >
                                    <option value="member">Member (Üye)</option> 
                                    <option value="admin">Admin (Yönetici)</option>
                                </select>
                            </div>
                        </div>
                        {/* Hata Mesajı Alanı */}
                        {error && (
                            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}
                    </div>
                    {/* Modal Footer (Butonlar) */}
                    <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                        <button 
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" 
                            type="button" 
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            <span className="truncate">İptal</span>
                        </button>
                        <button 
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/30 disabled:opacity-70" 
                            type="submit"
                            disabled={isLoading}
                        >
                            <span className="truncate">{isLoading ? "Ekleniyor..." : "Davet Et"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewMemberModal;

