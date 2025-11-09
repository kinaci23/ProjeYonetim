// frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import userService from '@/services/userService'; 

function ProfilePage() {
    const navigate = useNavigate();

    // --- State'ler ---
    const [userName, setUserName] = useState('Kullanıcı Adı'); // YENİ EKLENDİ
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [title, setTitle] = useState('');
    
    const [isLoading, setIsLoading] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); 

    // --- Veri Çekme (GÜNCELLENDİ) ---
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const userData = await userService.getProfile(); 
                
                setFirstName(userData.first_name || '');
                setLastName(userData.last_name || '');
                setTitle(userData.title || '');
                
                // Topbar için kullanıcı adını ayarla
                if (userData.first_name && userData.last_name) {
                    setUserName(`${userData.first_name} ${userData.last_name}`);
                } else if (userData.first_name) {
                    setUserName(userData.first_name);
                } else {
                    setUserName(userData.email);
                }
                
            } catch (err) {
                console.error("Profil yükleme hatası:", err);
                if (err.response && err.response.status === 401) {
                    authService.logout();
                    navigate('/login');
                } else {
                    setError("Profil bilgileri yüklenemedi.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // --- Fonksiyonlar ---
    const handleLogout = () => {
        authService.logout(); 
        navigate('/login');   
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const updatedUser = await userService.updateProfile({ // Güncellenmiş veriyi al
                first_name: firstName,
                last_name: lastName,
                title: title
            });
            
            // Topbar'daki adı anında güncelle
            if (updatedUser.first_name && updatedUser.last_name) {
                setUserName(`${updatedUser.first_name} ${updatedUser.last_name}`);
            } else if (updatedUser.first_name) {
                setUserName(updatedUser.first_name);
            } else {
                setUserName(updatedUser.email);
            }

            setSuccess('Profil başarıyla güncellendi!');
            setTimeout(() => setSuccess(null), 2000);

        } catch (err) {
            console.error("Profil güncelleme hatası:", err);
            if (err.response && err.response.status === 401) {
                authService.logout();
                navigate('/login');
            } else {
                setError(err.response?.data?.detail || "Profil güncellenemedi.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full flex-row bg-background-light dark:bg-background-dark">
            
            {/* 1. SideNavBar (GÜNCELLENDİ) */}
            <aside className="flex h-full w-64 flex-col bg-[#1A202C] p-4 text-gray-300">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div 
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
                            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMaQEOq8ZXnL4TNNc2M9HDqWC0UymPRVZTqc-y7GUqVYYpaMye5aYBVcigxuvtjmgquWhXPFsWvAVoVy1f20M9aQ9B3wj5SWOM0nzCV1y7KrWHvXrdRk4MBXga-QouQFeHlDgfejieT5kWfMzZJk3FOx2UIzoW1boU2xBkM9ufYCrSx1ZeMszeuGbF5MEYycngcjF8Zf1YE0MWEHuD3Z_j_wLfvgNZpKWj0IumpsrRt9cbXH39KOU08_4J8WdM5E3NWo_YLM-NmN5q")'}}
                        ></div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-medium leading-normal">ProjectFlow</h1>
                            <p className="text-gray-400 text-sm font-normal leading-normal">SaaS</p>
                        </div>
                    </div>
                    <nav className="mt-6 flex flex-col gap-2">
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/dashboard">
                            <span className="material-symbols-outlined">folder</span>
                            <p className="text-sm font-medium leading-normal">Projeler</p>
                        </Link>
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/tasks">
                            <span className="material-symbols-outlined">checklist</span>
                            <p className="text-sm font-medium leading-normal">Görevler</p>
                        </Link>
                        {/* "Ayarlar" linki SİLİNDİ */}
                    </nav>
                </div>
            </aside>
            
            {/* 2. Ana İçerik Alanı */}
            <main className="flex h-full flex-1 flex-col overflow-y-auto">
                
                {/* 3. TopNavBar (GÜNCELLENDİ) */}
                <header className="flex items-center justify-end whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-10 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex-shrink-0">
                                <div 
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hover:ring-2 hover:ring-primary hover:ring-offset-2 dark:hover:ring-offset-background-dark transition-all" 
                                    style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}
                                ></div> 
                            </Link>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userName}</span>
                        </div> 
                        <button 
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90"
                            onClick={handleLogout}
                        >
                            <span className="truncate">Çıkış Yap</span>
                        </button>
                    </div>
                </header>
                
                {/* 4. Form Kartı */}
                <div className="flex-1 p-8">
                    <div className="mx-auto max-w-4xl">
                        
                        {isLoading && (
                             <div className="py-20 text-center text-gray-500">Profil Yükleniyor...</div>
                        )}

                        {!isLoading && (
                            <form onSubmit={handleSave} className="rounded-xl border border-[#e0dbe6] dark:border-gray-800 bg-white dark:bg-[#1A202C] p-6 md:p-8">
                                
                                <div className="flex flex-wrap justify-between gap-3 pb-6 border-b border-[#e0dbe6] dark:border-gray-700">
                                    <div className="flex min-w-72 flex-col gap-2">
                                        <p className="text-[#141118] dark:text-white text-2xl font-bold leading-tight tracking-[-0.033em]">Kullanıcı Profili</p>
                                        <p className="text-[#755f8c] dark:text-gray-400 text-base font-normal leading-normal">Profil bilgilerinizi güncelleyin. Bu bilgiler projelerde diğer üyeler tarafından görülecektir.</p>
                                    </div>
                                </div>
                                
                                <div className="py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        <label className="flex flex-col flex-1">
                                            <p className="text-[#141118] dark:text-gray-300 text-base font-medium leading-normal pb-2">İsim</p>
                                            <input 
                                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#141118] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e0dbe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 h-12 placeholder:text-[#755f8c] dark:placeholder:text-gray-500 px-4 py-2 text-base font-normal leading-normal" 
                                                placeholder="Adınızı girin" 
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </label>
                                        
                                        <label className="flex flex-col flex-1">
                                            <p className="text-[#141118] dark:text-gray-300 text-base font-medium leading-normal pb-2">Soyad</p>
                                            <input 
                                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#141118] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e0dbe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 h-12 placeholder:text-[#755f8c] dark:placeholder:text-gray-500 px-4 py-2 text-base font-normal leading-normal" 
                                                placeholder="Soyadınızı girin" 
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </label>
                                        
                                        <label className="flex flex-col col-span-1 md:col-span-2">
                                            <p className="text-[#141118] dark:text-gray-300 text-base font-medium leading-normal pb-2">Unvan</p>
                                            <input 
                                                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#141118] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e0dbe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 h-12 placeholder:text-[#755f8c] dark:placeholder:text-gray-500 px-4 py-2 text-base font-normal leading-normal" 
                                                placeholder="Örn: Frontend Geliştirici" 
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="my-4 rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="my-4 rounded-lg border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
                                        {success}
                                    </div>
                                )}

                                <div className="flex justify-end pt-6 border-t border-[#e0dbe6] dark:border-gray-700">
                                    <button 
                                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                        type="submit"
                                        disabled={isSubmitting || isLoading}
                                    >
                                        <span className="truncate">
                                            {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;