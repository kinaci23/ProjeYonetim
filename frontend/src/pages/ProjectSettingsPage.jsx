import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; 
// Çalışan import yöntemimiz: göreceli yol ve uzantı YOK
import authService from '../services/authService';
import projectService from '../services/projectService'; 
import userService from '../services/userService'; // YENİ EKLENDİ

function ProjectSettingsPage() {
    const navigate = useNavigate();
    const { projectId } = useParams(); // URL'den proje ID'sini al
    
    // --- State'ler ---
    const [userName, setUserName] = useState('Kullanıcı Adı'); // YENİ EKLENDİ
    const [project, setProject] = useState(null); // Projenin ana verisi (üyeler dahil)
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); // Kaydetme/Silme işlemleri için
    
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

    // --- Veri Çekme (useEffect) ---
    useEffect(() => {
        if (!projectId) return; 

        const fetchProjectDetails = async () => {
            setIsLoading(true); 
            setError(null);
            try {
                const projectData = await projectService.getProjectById(projectId);
                setProject(projectData);
                setProjectName(projectData.name);
                setProjectDescription(projectData.description || '');
            } catch (err) {
                 console.error("Proje Detay çekme hatası:", err);
                 if ((err.response && err.response.status === 401) || !err.response) {
                    authService.logout(); navigate('/login');   
                 } 
                 else if (err.response && err.response.status === 403) {
                    setError("Bu proje ayarlarını görüntüleme yetkiniz yok.");
                 } else {
                    setError("Proje yüklenirken bir hata oluştu.");
                 }
            } finally {
                setIsLoading(false); 
            }
        };
        fetchProjectDetails(); 
    }, [projectId, navigate, refreshTrigger]); 
    

    // --- Fonksiyonlar ---
    const handleLogout = () => { authService.logout(); navigate('/login'); };
    const handleDataChanged = () => { setRefreshTrigger(prev => prev + 1); };

    // ... (handleUpdateProjectDetails, handleUpdateRole, handleRemoveMember, handleDeleteProject fonksiyonları olduğu gibi kalıyor) ...
    const handleUpdateProjectDetails = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await projectService.updateProject(projectId, {
                name: projectName,
                description: projectDescription
            });
            handleDataChanged(); 
            alert("Proje detayları başarıyla güncellendi!"); 
        } catch (err) {
            console.error("Proje güncelleme hatası:", err);
            setError(err.response?.data?.detail || "Proje güncellenemedi.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleUpdateRole = async (memberId, newRole) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await projectService.updateMemberRole(projectId, memberId, newRole);
            handleDataChanged(); 
        } catch (err) {
            console.error("Üye rolü güncelleme hatası:", err);
            setError(err.response?.data?.detail || "Rol güncellenemedi.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleRemoveMember = async (memberId, memberEmail) => {
        if (!window.confirm(`'${memberEmail}' kullanıcısını projeden kaldırmak istediğinizden emin misiniz?`)) {
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await projectService.removeMember(projectId, memberId);
            handleDataChanged();
        } catch (err)
        {
            console.error("Üye kaldırma hatası:", err);
            setError(err.response?.data?.detail || "Üye kaldırılamadı.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteProject = async () => {
        const confirmationText = project.name;
        const userInput = window.prompt(`PROJEYİ SİLMEK ÜZERESİNİZ!\n\nBu işlem geri alınamaz ve projeye ait TÜM GÖREVLER silinecektir.\nOnaylamak için projenin adını ("${confirmationText}") yazın:`);

        if (userInput !== confirmationText) {
            alert("Onay metni eşleşmedi. Proje silinmedi.");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        try {
            await projectService.deleteProject(projectId);
            alert("Proje başarıyla silindi.");
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Proje silme hatası:", err);
            setError(err.response?.data?.detail || "Proje silinemedi.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- ANA JSX ---
    return (
        <div className="flex h-screen w-full flex-row bg-background-light dark:bg-background-dark">
            
            {/* --- SideNavBar (GÜNCELLENDİ) --- */}
            <aside className="flex h-full w-64 flex-shrink-0 flex-col bg-[#1A202C] p-4 text-gray-300">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMaQEOq8ZXnL4TNNc2M9HDqWC0UymPRVZTqc-y7GUqVYYpaMye5aYBVcigxuvtjmgquWhXPFsWvAVoVy1f20M9aQ9B3wj5SWOM0nzCV1y7KrWHvXrdRk4MBXga-QouQFeHlDgfejieT5kWfMzZJk3FOx2UIzoW1boU2xBkM9ufYCrSx1ZeMszeuGbF5MEYycngcjF8Zf1YE0MWEHuD3Z_j_wLfvgNZpKWj0IumpsrRt9cbXH39KOU08_4J8WdM5E3NWo_YLM-NmN5q")'}}></div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-medium leading-normal">ProjectFlow</h1>
                            <p className="text-gray-400 text-sm font-normal leading-normal">SaaS</p>
                        </div>
                    </div>
                    <nav className="mt-6 flex flex-col gap-2">
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10" to="/dashboard">
                            <span className="material-symbols-outlined">folder</span> 
                            <p className="text-sm font-medium leading-normal">Projeler</p>
                        </Link>
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10" to="/tasks">
                            <span className="material-symbols-outlined">checklist</span>
                            <p className="text-sm font-medium leading-normal">Görevler</p>
                        </Link>
                        {/* YENİ "NOTLAR" LİNKİ EKLENDİ */}
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/notes">
                            <span className="material-symbols-outlined">description</span>
                            <p className="text-sm font-medium leading-normal">Notlar</p>
                        </Link>
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
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90" onClick={handleLogout}>
                            <span className="truncate">Çıkış Yap</span>
                        </button>
                    </div>
                </header>
                
                {/* --- Sayfa İçeriği --- */}
                <div className="flex-1 p-6 md:p-10 bg-background-light dark:bg-background-dark">
                    <div className="mx-auto max-w-4xl">
                        
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <Link className="text-[#755f8c] dark:text-gray-400 text-sm font-medium hover:text-primary" to="/dashboard">Projeler</Link>
                            <span className="text-[#755f8c] dark:text-gray-500 text-sm font-normal">/</span>
                            <Link className="text-[#755f8c] dark:text-gray-400 text-sm font-medium hover:text-primary" to={`/projects/${projectId}`}>
                                {isLoading ? "..." : (project?.name || "Proje")}
                            </Link>
                            <span className="text-[#755f8c] dark:text-gray-500 text-sm font-normal">/</span>
                            <span className="text-[#141118] dark:text-gray-200 text-sm font-medium">Ayarlar</span>
                        </div>

                        {isLoading && (<div className="text-center py-10 dark:text-white">Proje ayarları yükleniyor...</div>)}
                        {error && (<div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>)}
                        
                        {!isLoading && project && (
                            <div className="flex flex-col gap-8">
                                
                                <form onSubmit={handleUpdateProjectDetails} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A202C] p-6">
                                    <h3 className="text-lg font-bold text-[#141118] dark:text-gray-100">Proje Detayları</h3>
                                    <p className="text-[#755f8c] dark:text-gray-400 text-sm font-normal mt-1">Projenizin adını ve açıklamasını güncelleyin.</p>
                                    <div className="mt-6 space-y-6">
                                        <div>
                                            <label className="text-[#141118] dark:text-gray-300 text-sm font-medium block pb-2" htmlFor="project-name">Proje Adı</label>
                                            <input 
                                                className="form-input flex w-full rounded-lg text-[#141118] dark:text-gray-200 border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800/50 h-12 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30" 
                                                id="project-name" 
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#141118] dark:text-gray-300 text-sm font-medium block pb-2" htmlFor="project-description">Açıklama</label>
                                            <textarea 
                                                className="form-textarea flex w-full rounded-lg text-[#141118] dark:text-gray-200 border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800/50 h-32 p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30" 
                                                id="project-description" 
                                                placeholder="Proje açıklamasını giriniz..."
                                                value={projectDescription}
                                                onChange={(e) => setProjectDescription(e.target.value)}
                                                disabled={isSubmitting}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button 
                                            type="submit"
                                            className="flex rounded-lg h-10 bg-primary text-white text-sm font-bold px-6 items-center justify-center disabled:opacity-50 transition-transform duration-200 hover:scale-105 active:scale-95"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                                        </button>
                                    </div>
                                </form>
                                
                                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A202C] p-6">
                                    <h3 className="text-lg font-bold text-[#141118] dark:text-gray-100">Üyeleri Yönet</h3>
                                    <div className="mt-4 flex flex-col">
                                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                            {project.memberships.map(member => (
                                                <div key={member.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                    <p className="text-[#141118] dark:text-gray-200 text-sm font-medium">{member.user.email}</p>
                                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                                        <select 
                                                            className="form-select flex w-full rounded-lg text-[#141118] dark:text-gray-200 border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-gray-800/50 h-10 text-sm"
                                                            value={member.role}
                                                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                                            disabled={isSubmitting || (project.memberships.length === 1 && member.role === 'admin')}
                                                        >
                                                            <option value="admin">Admin</option>
                                                            <option value="member">Member</option>
                                                        </select>
                                                        <button 
                                                            className="flex h-10 shrink-0 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-500/10 text-sm font-bold px-4 items-center justify-center disabled:opacity-50"
                                                            onClick={() => handleRemoveMember(member.id, member.user.email)}
                                                            disabled={isSubmitting || member.user.id === authService.getCurrentUserId()}
                                                        >
                                                            Kaldır
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="rounded-xl border border-red-500/50 dark:border-red-500/40 bg-white dark:bg-[#1A202C] p-6">
                                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-red-600 dark:text-red-500">Projeyi Sil</h3>
                                            <p className="text-[#755f8c] dark:text-gray-400 text-sm mt-1 max-w-md">Bu işlem geri alınamaz. Projeyle ilişkili tüm görevler ve üyelikler kalıcı olarak silinecektir.</p>
                                        </div>
                                        <button 
                                            className="flex rounded-lg h-10 bg-red-600 text-white text-sm font-bold px-6 items-center justify-center whitespace-nowrap disabled:opacity-50 transition-transform duration-200 hover:scale-105 active:scale-95"
                                            onClick={handleDeleteProject}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Siliniyor..." : "PROJEYİ KALICI OLARAK SİL"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProjectSettingsPage;