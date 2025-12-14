import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout'; // Layout import edildi
import userService from '@/services/userService'; 

function ProfilePage() {
    const navigate = useNavigate();

    // --- State'ler ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [title, setTitle] = useState('');
    
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); 

    // --- Veri Çekme ---
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const userData = await userService.getProfile(); 
                setFirstName(userData.first_name || '');
                setLastName(userData.last_name || '');
                setTitle(userData.title || '');
            } catch (err) {
                console.error("Profil yükleme hatası:", err);
                setError("Profil bilgileri yüklenemedi.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // --- Fonksiyonlar ---
    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await userService.updateProfile({ 
                first_name: firstName,
                last_name: lastName,
                title: title
            });
            setSuccess('Profil başarıyla güncellendi!');
            
            // Sayfayı yenilemeye gerek yok, ama Layout'taki ismin değişmesi için 
            // ya bir context kullanmak lazım ya da basitçe sayfayı yenilemek.
            // En temizi şimdilik kullanıcıyı bilgilendirip bırakmak.
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error("Profil güncelleme hatası:", err);
            setError(err.response?.data?.detail || "Profil güncellenemedi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Header Left Content ---
    const headerLeftContent = (
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Profil Ayarları</h2>
    );

    // --- ANA JSX ---
    return (
        <MainLayout headerLeft={headerLeftContent}>
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="mx-auto max-w-3xl">
                    
                    {isLoading && (
                         <div className="py-20 text-center text-gray-500">Profil Yükleniyor...</div>
                    )}

                    {!isLoading && (
                        <form onSubmit={handleSave} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A202C] p-8 shadow-sm">
                            
                            <div className="flex flex-col gap-2 pb-8 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                                        {(firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-[#141118] dark:text-white text-xl font-bold">Kişisel Bilgiler</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Projelerde görünecek kimlik bilgilerinizi güncelleyin.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="py-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="flex flex-col flex-1">
                                        <p className="text-[#141118] dark:text-gray-300 text-sm font-medium pb-2">İsim</p>
                                        <input 
                                            className="form-input flex w-full rounded-lg text-[#141118] dark:text-white border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                            placeholder="Adınız" 
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                    
                                    <label className="flex flex-col flex-1">
                                        <p className="text-[#141118] dark:text-gray-300 text-sm font-medium pb-2">Soyad</p>
                                        <input 
                                            className="form-input flex w-full rounded-lg text-[#141118] dark:text-white border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                            placeholder="Soyadınız" 
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                    
                                    <label className="flex flex-col col-span-1 md:col-span-2">
                                        <p className="text-[#141118] dark:text-gray-300 text-sm font-medium pb-2">Unvan / Rol</p>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">work</span>
                                            <input 
                                                className="form-input flex w-full rounded-lg text-[#141118] dark:text-white border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                                placeholder="Örn: Kıdemli Yazılım Mühendisi" 
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                                    {success}
                                </div>
                            )}

                            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    className="flex min-w-[120px] items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 hover:shadow-lg focus:ring-4 focus:ring-primary/30 disabled:opacity-50 transition-all duration-200"
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            <span>Kaydediliyor...</span>
                                        </div>
                                    ) : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default ProfilePage;