import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '@/services/authService';
import userService from '@/services/userService';
import NotificationMenu from '@/components/NotificationMenu';

const MainLayout = ({ children, headerLeft }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State'ler
    const [userName, setUserName] = useState('Kullanıcı');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobil menü durumu

    // Profil Verisini Çek
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await userService.getProfile();
                if (user.first_name) setUserName(`${user.first_name} ${user.last_name || ''}`);
                else setUserName(user.email);
            } catch (err) {
                console.error("Layout kullanıcı verisi hatası:", err);
            }
        };
        fetchUser();
    }, []);

    // Sayfa değiştiğinde mobil menüyü otomatik kapat
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const getLinkClass = (path) => {
        const base = "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200";
        const active = "bg-primary/20 text-white font-medium shadow-sm border border-primary/10"; 
        const inactive = "hover:bg-white/10 text-gray-400 hover:text-gray-200";
        return location.pathname.startsWith(path) ? `${base} ${active}` : `${base} ${inactive}`;
    };

    // Kod tekrarını önlemek için Menü Linklerini bir fonksiyonda topladık
    const renderNavLinks = () => (
        <nav className="flex flex-col gap-1.5 flex-1">
            <Link to="/dashboard" className={getLinkClass('/dashboard')} title="Projeler">
                <span className="material-symbols-outlined">folder</span> <span>Projeler</span>
            </Link>
            <Link to="/tasks" className={getLinkClass('/tasks')} title="Görevler">
                <span className="material-symbols-outlined">checklist</span> <span>Görevler</span>
            </Link>
            <Link to="/notes" className={getLinkClass('/notes')} title="Notlar">
                <span className="material-symbols-outlined">description</span> <span>Notlar</span>
            </Link>
        </nav>
    );

    return (
        <div className="flex h-screen w-full flex-row bg-background-light dark:bg-[#111827] overflow-hidden">
            
            {/* --- MOBİL MENÜ OVERLAY (Sadece mobilde açılınca görünür) --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Arkaplan Karartma (Tıklayınca kapanır) */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    
                    {/* Mobil Sidebar İçeriği */}
                    <aside className="relative flex w-64 flex-col bg-[#1A202C] p-4 text-gray-300 shadow-2xl h-full animate-in slide-in-from-left duration-300">
                        {/* Mobil Logo ve Kapat Butonu */}
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
                                    <span className="material-symbols-outlined text-lg">grid_view</span>
                                </div>
                                <span className="font-bold text-white tracking-tight">ProjectFlow</span>
                            </div>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1 rounded-md hover:bg-white/10 text-gray-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Linkler (Fonksiyondan geliyor) */}
                        {renderNavLinks()}
                        
                        {/* Mobilde alta profil kısayolu eklenebilir */}
                        <div className="mt-auto border-t border-gray-700 pt-4">
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors">
                                <span className="material-symbols-outlined">logout</span>
                                <span>Çıkış Yap</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* --- DESKTOP SIDEBAR (Sadece md ve üzeri ekranlarda görünür) --- */}
            <aside className="hidden md:flex h-full w-20 lg:w-64 flex-shrink-0 flex-col bg-[#1A202C] p-4 text-gray-300 transition-all duration-300 border-r border-gray-800">
                <div className="flex items-center gap-3 px-2 py-4 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">grid_view</span>
                    </div>
                    <h1 className="hidden lg:block text-white font-bold text-xl tracking-tight">
                        ProjectFlow
                    </h1>
                </div>
                {renderNavLinks()}
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="flex flex-1 flex-col h-screen overflow-hidden relative">
                
                {/* --- TOPBAR --- */}
                <header className="flex-shrink-0 flex justify-between items-center px-4 md:px-6 py-3 border-b bg-white dark:bg-[#1A202C] dark:border-gray-800 z-20 shadow-sm">
                    
                    {/* Header Left */}
                    <div className="flex items-center gap-3 min-w-0">
                        
                        {/* HAMBURGER BUTONU (Sadece Mobilde Görünür) */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        {/* Sayfa Başlığı / İçeriği */}
                        {headerLeft}
                    </div>

                    {/* Header Right */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        
                        <NotificationMenu />

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        <Link to="/profile" className="flex items-center gap-3 group pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hoş geldin,</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-none">{userName}</p>
                            </div>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 border-white dark:border-gray-700 shadow-sm group-hover:border-primary transition-colors" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}></div>
                        </Link>
                        
                        <button 
                            onClick={handleLogout} 
                            className="hidden sm:block p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" 
                            title="Güvenli Çıkış"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </header>

                {/* --- SAYFA İÇERİĞİ --- */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-gray-50 dark:bg-[#111827]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;