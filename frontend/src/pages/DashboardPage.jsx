import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout'; // Layout bileşenimiz
import projectService from '@/services/projectService'; 
import NewProjectModal from '@/components/NewProjectModal';

function DashboardPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

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
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects(); 
    }, [navigate, refreshTrigger]); 
    
    const handleProjectCreated = () => {
        setIsModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };
    
    // Yardımcı fonksiyon: İçerik renderlama
    const renderMainContent = () => {
        if (isLoading) return <div className="flex flex-1 items-center justify-center"><p className="text-lg font-medium dark:text-white">Yükleniyor...</p></div>;
        if (error) return <div className="flex flex-1 items-center justify-center"><p className="text-lg font-medium text-red-500">{error}</p></div>;

        if (projects.length === 0) {
            return (
                <div className="flex flex-1 items-center justify-center px-4 py-6">
                    <div className="flex flex-col items-center gap-6">
                        <div className="bg-center bg-no-repeat aspect-video bg-contain w-full max-w-[360px]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDK6CnJCZSN9xaKbry7x3SBp_PoUzWqRkAUmpH9G6IypyTA0kGQ9FY4O4rqtMgU5BA7mZjjRjpz1By--Dtf0r4JxZtZB3NXVV-x9CIxgI85LS_LXMJXB1fECd6Zv8RYLrXgU-yE0wxHLVFuEYc63Bt-pukYUsLe8GWusruAuzOkCHRDFmBOeZxMn7gUK0Y-8J0kLhZOF7uPrx6IFESxyAMwtMD4p10gOQwrOl6-3dKvFHHdfNDO77H0VYEArFm5ybdrUYNx8PSql2zh")'}}></div>
                        <div className="flex max-w-[480px] flex-col items-center gap-2">
                            <p className="text-lg font-bold text-center text-[#140d1b] dark:text-white">Henüz projeniz yok</p>
                            <p className="text-sm font-normal text-center text-gray-600 dark:text-gray-400">Başlamak için 'Yeni Proje Ekle' düğmesine tıklayın.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {projects.map((project) => (
                    <Link key={project.id} to={`/projects/${project.id}`} className="block rounded-lg bg-white dark:bg-[#1A202C] p-6 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-100 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{project.name}</h3>
                            <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">{project.description || "Açıklama yok."}</p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex flex-wrap gap-2">
                                {project.memberships.slice(0, 3).map((member) => (
                                    <span key={member.user.id} className={`px-2 py-1 rounded text-xs font-semibold ${member.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {member.user.email.split('@')[0]}
                                    </span>
                                ))}
                                {project.memberships.length > 3 && <span className="text-xs text-gray-500 self-center">+{project.memberships.length - 3}</span>}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <MainLayout>
            <NewProjectModal show={isModalOpen} onClose={() => setIsModalOpen(false)} onProjectCreated={handleProjectCreated} />
            
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Projelerim</h1>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        <span>Yeni Proje</span>
                    </button>
                </div>
                {renderMainContent()}
            </div>
        </MainLayout>
    );
}

export default DashboardPage;