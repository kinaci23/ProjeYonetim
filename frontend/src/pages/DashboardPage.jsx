import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// HATA DÜZELTMESİ: vite.config.js'te tanımladığımız '@/' alias'ını kullanıyoruz
import authService from '@/services/authService';
import projectService from '@/services/projectService'; 
import NewProjectModal from '@/components/NewProjectModal';
import userService from '@/services/userService'; // YENİ EKLENDİ

function DashboardPage() {
    const navigate = useNavigate();

    // --- State'ler ---
    const [userName, setUserName] = useState('Kullanıcı Adı'); // YENİ EKLENDİ
    const [projects, setProjects] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // YENİ useEffect (Kullanıcı Adını Çekmek İçin)
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const userData = await userService.getProfile();
                if (userData.first_name && userData.last_name) {
                    setUserName(`${userData.first_name} ${userData.last_name}`);
                } else if (userData.first_name) {
                    setUserName(userData.first_name);
                } else {
                    setUserName(userData.email);
                }
            } catch (err) {
                console.error("Kullanıcı adı çekilemedi:", err);
                if (err.response && err.response.status === 401) {
                    authService.logout();
                    navigate('/login');
                }
            }
        };
        fetchUserName();
    }, [navigate]);

    // --- Veri Çekme ---
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true); 
            setError(null);    
            try {
                const data = await projectService.getProjects();
                setProjects(data);
            } catch (err) {
                console.error("Proje çekme hatası:", err);
                setError("Projeler yüklenirken bir hata oluştu.");
                if (err.response && err.response.status === 401) {
                    authService.logout(); 
                    navigate('/login'); 
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects(); 

    }, [navigate, refreshTrigger]); 
    
    // --- Fonksiyonlar ---
    const handleLogout = () => {
        authService.logout(); 
        navigate('/login');   
    };
    
    const handleProjectCreated = () => {
        setIsModalOpen(false); // Modalı kapat
        setRefreshTrigger(prev => prev + 1); // Listeyi yenile
    };
    
    // --- İçeriği Gösterme Fonksiyonu ---
    const renderMainContent = () => {
        
        if (isLoading) {
            return (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-lg font-medium dark:text-white">Yükleniyor...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-lg font-medium text-red-500">{error}</p>
                </div>
            );
        }

        if (projects.length === 0) {
            // EmptyState 
            return (
                <div className="flex flex-1 items-center justify-center px-4 py-6">
                    <div className="flex flex-col items-center gap-6">
                        <div 
                            className="bg-center bg-no-repeat aspect-video bg-contain w-full max-w-[360px]" 
                            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDK6CnJCZSN9xaKbry7x3SBp_PoUzWqRkAUmpH9G6IypyTA0kGQ9FY4O4rqtMgU5BA7mZjjRjpz1By--Dtf0r4JxZtZB3NXVV-x9CIxgI85LS_LXMJXB1fECd6Zv8RYLrXgU-yE0wxHLVFuEYc63Bt-pukYUsLe8GWusruAuzOkCHRDFmBOeZxMn7gUK0Y-8J0kLhZOF7uPrx6IFESxyAMwtMD4p10gOQwrOl6-3dKvFHHdfNDO77H0VYEArFm5ybdrUYNx8PSql2zh")'}}
                        ></div>
                        <div className="flex max-w-[480px] flex-col items-center gap-2">
                            <p className="text-lg font-bold text-center text-[#140d1b] dark:text-white">Henüz projeniz yok</p>
                            <p className="text-sm font-normal text-center text-gray-600 dark:text-gray-400">Başlamak için 'Yeni Proje Ekle' düğmesine tıklayın.</p>
                        </div>
                    </div>
                </div>
            );
        }

        // Proje Listeleme (Proje Detay Linkleri Eklendi)
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {projects.map((project) => (
                    <Link 
                        key={project.id} 
                        to={`/projects/${project.id}`}
                        className="block rounded-lg bg-white dark:bg-[#1A202C] p-6 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-100"
                    >
                        <h3 className="text-xl font-bold text-primary dark:text-white">{project.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                        
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-400 mb-2">Üyeler ({project.memberships.length}):</p>
                            <div className="flex flex-wrap gap-2">
                                {project.memberships.map((member) => (
                                    <span 
                                        key={member.user.id} 
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            member.role === 'admin' 
                                            ? 'bg-purple-200 text-purple-800' 
                                            : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        {member.user.email} ({member.role})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };
    // ----------------------------------------

    return (
        <>
            <NewProjectModal 
                show={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onProjectCreated={handleProjectCreated} 
            />

            <div className="flex h-screen w-full flex-row bg-background-light dark:bg-background-dark">
                
                {/* --- SideNavBar (GÜNCELLENDİ) --- */}
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
                            <Link className="flex items-center gap-3 rounded-lg bg-primary/30 px-3 py-2 text-white" to="/dashboard">
                                <span className="material-symbols-outlined fill">folder</span>
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
                
                {/* --- Ana İçerik --- */}
                <main className="flex h-full flex-1 flex-col overflow-y-auto">
                    
                    {/* --- TopNavBar (GÜNCELLENDİ) --- */}
                    <header className="flex items-center justify-end whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-10 py-3">
                        <div className="flex items-center gap-4">
                            
                            {/* Avatar ve Kullanıcı Adı sarmalayıcısı (GÜNCELLENDİ) */}
                            <div className="flex items-center gap-3">
                                <Link to="/profile" className="flex-shrink-0">
                                    <div 
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hover:ring-2 hover:ring-primary hover:ring-offset-2 dark:hover:ring-offset-background-dark transition-all" 
                                        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}
                                    ></div> 
                                </Link>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userName}</span>
                            </div> 

                            {/* Çıkış Yap Butonu */}
                            <button 
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90"
                                onClick={handleLogout}
                            >
                                <span className="truncate">Çıkış Yap</span>
                            </button>
                        </div>
                    </header>
                    
                    {/* --- Sayfa İçeriği --- */}
                    <div className="flex flex-1 flex-col p-6 lg:p-10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h1 className="text-4xl font-black leading-tight tracking[-0.033em] text-[#140d1b] dark:text-white">Projelerim</h1>
                            
                            <button 
                                className="flex items-center gap-2 min-w-[84px] max-w-[480px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90"
                                onClick={() => setIsModalOpen(true)} // Modal'ı açar
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                <span className="truncate">Yeni Proje Ekle</span>
                            </button>
                        </div>
                        
                        {/* Dinamik içerik alanı */}
                        {renderMainContent()}

                    </div>
                </main>
            </div>
        </>
    );
}

export default DashboardPage;