import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; 
import MainLayout from '@/components/MainLayout'; // Layout import edildi
import projectService from '@/services/projectService'; 
import authService from '@/services/authService'; // Sadece ID kontrolü için gerekli olabilir

function ProjectSettingsPage() {
    const navigate = useNavigate();
    const { projectId } = useParams(); 
    
    // --- State'ler ---
    const [project, setProject] = useState(null); 
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // --- Veri Çekme ---
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
                 if (err.response && err.response.status === 403) {
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
    const handleDataChanged = () => { setRefreshTrigger(prev => prev + 1); };

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
        if (!window.confirm(`'${memberEmail}' kullanıcısını projeden kaldırmak istediğinizden emin misiniz?`)) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await projectService.removeMember(projectId, memberId);
            handleDataChanged();
        } catch (err) {
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
    
    // --- Header Left Content (Breadcrumb) ---
    const headerLeftContent = (
        <div className="flex flex-wrap items-center gap-2">
            <Link className="text-gray-500 hover:text-primary transition-colors text-sm font-medium" to="/dashboard">Projeler</Link>
            <span className="text-gray-400 text-sm">/</span>
            <Link className="text-gray-500 hover:text-primary transition-colors text-sm font-medium" to={`/projects/${projectId}`}>
                {isLoading ? "..." : (project?.name || "Proje")}
            </Link>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-gray-800 dark:text-gray-200 text-sm font-bold">Ayarlar</span>
        </div>
    );

    // --- ANA JSX ---
    return (
        <MainLayout headerLeft={headerLeftContent}>
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="mx-auto max-w-4xl">
                    
                    {isLoading && (<div className="text-center py-10 dark:text-white">Proje ayarları yükleniyor...</div>)}
                    {error && (<div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>)}
                    
                    {!isLoading && project && (
                        <div className="flex flex-col gap-8">
                            
                            {/* Proje Detay Formu */}
                            <form onSubmit={handleUpdateProjectDetails} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A202C] p-6">
                                <h3 className="text-lg font-bold text-[#141118] dark:text-gray-100">Proje Detayları</h3>
                                <p className="text-[#755f8c] dark:text-gray-400 text-sm font-normal mt-1">Projenizin adını ve açıklamasını güncelleyin.</p>
                                <div className="mt-6 space-y-6">
                                    <div>
                                        <label className="text-[#141118] dark:text-gray-300 text-sm font-medium block pb-2" htmlFor="project-name">Proje Adı</label>
                                        <input 
                                            className="form-input flex w-full rounded-lg text-[#141118] dark:text-gray-200 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-12 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30" 
                                            id="project-name" 
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#141118] dark:text-gray-300 text-sm font-medium block pb-2" htmlFor="project-description">Açıklama</label>
                                        <textarea 
                                            className="form-textarea flex w-full rounded-lg text-[#141118] dark:text-gray-200 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-32 p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30" 
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
                            
                            {/* Üye Yönetimi */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A202C] p-6">
                                <h3 className="text-lg font-bold text-[#141118] dark:text-gray-100">Üyeleri Yönet</h3>
                                <div className="mt-4 flex flex-col">
                                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {project.memberships.map(member => (
                                            <div key={member.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                                                        {member.user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p className="text-[#141118] dark:text-gray-200 text-sm font-medium">{member.user.email}</p>
                                                </div>
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <select 
                                                        className="form-select flex w-full md:w-32 rounded-lg text-[#141118] dark:text-gray-200 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-9 text-sm py-1"
                                                        value={member.role}
                                                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                                        disabled={isSubmitting || (project.memberships.length === 1 && member.role === 'admin')}
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="member">Member</option>
                                                    </select>
                                                    <button 
                                                        className="flex h-9 shrink-0 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold px-3 items-center justify-center disabled:opacity-50 transition-colors"
                                                        onClick={() => handleRemoveMember(member.id, member.user.email)}
                                                        disabled={isSubmitting || (member.user.id === parseInt(authService.getCurrentUserId()))}
                                                    >
                                                        Kaldır
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Proje Silme */}
                            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 p-6">
                                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Projeyi Sil</h3>
                                        <p className="text-red-600/80 dark:text-red-400/70 text-sm mt-1 max-w-md">Bu işlem geri alınamaz. Projeyle ilişkili tüm görevler ve üyelikler kalıcı olarak silinecektir.</p>
                                    </div>
                                    <button 
                                        className="flex rounded-lg h-10 bg-red-600 text-white text-sm font-bold px-6 items-center justify-center whitespace-nowrap disabled:opacity-50 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-sm shadow-red-500/30"
                                        onClick={handleDeleteProject}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Siliniyor..." : "Projeyi Sil"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default ProjectSettingsPage;