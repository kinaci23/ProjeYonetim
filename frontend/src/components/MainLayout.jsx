import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '@/services/authService';
import userService from '@/services/userService';

const MainLayout = ({ children, headerLeft }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('Kullanıcı');

    // Kullanıcı bilgisini sadece bir kez, burada çekiyoruz.
    // Diğer sayfaların bunu tekrar yapmasına gerek kalmayacak.
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await userService.getProfile();
                if (user.first_name) setUserName(`${user.first_name} ${user.last_name || ''}`);
                else setUserName(user.email);
            } catch (err) {
                console.error("Layout kullanıcı verisi hatası:", err);
                // Token hatası varsa api.js interceptor zaten login'e atar.
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Aktif menü öğesini belirlemek için yardımcı fonksiyon
    const getLinkClass = (path) => {
        const base = "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200";
        const active = "bg-primary/20 text-white font-medium shadow-sm border border-primary/10"; 
        const inactive = "hover:bg-white/10 text-gray-400 hover:text-gray-200";
        
        // Basit aktiflik kontrolü
        return location.pathname.startsWith(path) ? `${base} ${active}` : `${base} ${inactive}`;
    };

    return (
        <div className="flex h-screen w-full flex-row bg-background-light dark:bg-[#111827] overflow-hidden">
            
            {/* --- SIDEBAR (Tek Merkez) --- */}
            <aside className="hidden md:flex h-full w-20 lg:w-64 flex-shrink-0 flex-col bg-[#1A202C] p-4 text-gray-300 transition-all duration-300 border-r border-gray-800">
                <div className="flex items-center gap-3 px-2 py-3 mb-6">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 lg:size-10 flex-shrink-0 shadow-inner" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMaQEOq8ZXnL4TNNc2M9HDqWC0UymPRVZTqc-y7GUqVYYpaMye5aYBVcigxuvtjmgquWhXPFsWvAVoVy1f20M9aQ9B3wj5SWOM0nzCV1y7KrWHvXrdRk4MBXga-QouQFeHlDgfejieT5kWfMzZJk3FOx2UIzoW1boU2xBkM9ufYCrSx1ZeMszeuGbF5MEYycngcjF8Zf1YE0MWEHuD3Z_j_wLfvgNZpKWj0IumpsrRt9cbXH39KOU08_4J8WdM5E3NWo_YLM-NmN5q")'}}></div>
                    <div className="hidden lg:flex flex-col overflow-hidden">
                        <h1 className="text-white font-bold tracking-tight truncate">ProjectFlow</h1>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">SaaS v1.0</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1.5">
                    <Link to="/dashboard" className={getLinkClass('/dashboard')} title="Projeler">
                        <span className="material-symbols-outlined">folder</span> <span className="hidden lg:block">Projeler</span>
                    </Link>
                    <Link to="/tasks" className={getLinkClass('/tasks')} title="Görevler">
                        <span className="material-symbols-outlined">checklist</span> <span className="hidden lg:block">Görevler</span>
                    </Link>
                    <Link to="/notes" className={getLinkClass('/notes')} title="Notlar">
                        <span className="material-symbols-outlined">description</span> <span className="hidden lg:block">Notlar</span>
                    </Link>
                </nav>
                
                {/* Alt Kısım: Ayarlar vs. eklenebilir */}
                <div className="mt-auto pt-4 border-t border-gray-800 hidden lg:block">
                    <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors">
                         <span className="material-symbols-outlined">settings</span> <span>Ayarlar</span>
                    </Link>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="flex flex-1 flex-col h-screen overflow-hidden relative">
                
                {/* --- TOPBAR (Tek Merkez) --- */}
                <header className="flex-shrink-0 flex justify-between items-center px-6 py-3 border-b bg-white dark:bg-[#1A202C] dark:border-gray-800 z-20 shadow-sm">
                    
                    {/* Header Left: Sayfaya özel içerik (Başlık, Geri butonu vb.) */}
                    <div className="flex items-center gap-4 min-w-0">
                        {headerLeft}
                    </div>

                    {/* Header Right: Profil ve Çıkış (Sabit) */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <Link to="/profile" className="flex items-center gap-3 group pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hoş geldin,</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-none">{userName}</p>
                            </div>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 border-white dark:border-gray-700 shadow-sm group-hover:border-primary transition-colors" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}></div>
                        </Link>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <button 
                            onClick={handleLogout} 
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" 
                            title="Güvenli Çıkış"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </header>

                {/* --- SAYFA İÇERİĞİ --- */}
                {/* flex-1 ve overflow-hidden sayesinde içerik taşarsa 
                    sayfa değil, sadece bu div scroll olur (eğer child scroll isterse).
                */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-gray-50 dark:bg-[#111827]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;