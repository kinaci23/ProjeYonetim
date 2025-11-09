import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; 
// Çalışan import yöntemimiz: göreceli yol ve uzantı YOK
import authService from '../services/authService';
import projectService from '../services/projectService'; 
import taskService from '../services/taskService'; 
import NewTaskModal from '../components/NewTaskModal';
import NewMemberModal from '../components/NewMemberModal'; 
import TaskDetailModal from '../components/TaskDetailModal';

// --- DND-KIT (SÜRÜKLE-BIRAK) IMPORTLARI ---
import {
    DndContext, 
    closestCenter, 
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable, // Sütunlar için
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// ------------------------------------------

// --- YARDIMCI BİLEŞEN 1: Görev Kartı (TaskCard) (DÜZELTİLDİ) ---
// Sürükleme (listeners) ve Tıklama (onClick)
// artık 'PointerSensor' sayesinde aynı element üzerinde yaşayabilir.
function TaskCard({ task, onTaskClick }) {
    const {
        attributes,
        listeners, // Sürükleme dinleyicileri
        setNodeRef,
        transform,
        transition,
        isDragging, 
    } = useSortable({ 
        id: task.id.toString(), 
        data: {
            type: 'Task', // Bu bir Görev Kartı
            task: task // Tüm görev verisini taşıyoruz
        }
    }); 

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1, 
        zIndex: isDragging ? 100 : 1, 
    };

    return (
        // DÜZELTME: Hem 'onClick' hem 'listeners' artık bu ana div üzerinde
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners} // Sürüklemeyi başlatmak için (Tüm kart)
            onClick={() => onTaskClick(task.id.toString())} // Detay modalını açmak için (Tüm kart)
            className="block bg-white dark:bg-[#1A202C] rounded-lg p-4 shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
        >
            {/* İçerik (Artık ayrı bir tıklama div'ine gerek yok) */}
            <h4 className="font-bold text-[#1A202C] dark:text-white">{task.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description || "Açıklama girilmemiş."}</p>
            {task.due_date && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    Son Teslim: {new Date(task.due_date).toLocaleDateString('tr-TR')}
                </p>
            )}
            <p className="text-xs text-primary mt-1">Atanan: {task.assignee_id ? `Kullanıcı ID ${task.assignee_id}` : 'Yok'}</p>
        </div>
    );
}
// --------------------------------------------------

// --- YARDIMCI BİLEŞEN 2: Kanban Sütunu ---
// (Bu bileşende değişiklik yok, TaskCard'a 'onTaskClick'i iletiyor)
function KanbanColumn({ id, title, tasks, onTaskClick }) {
    const { setNodeRef } = useDroppable({
        id: id, 
        data: { type: 'Column' }
    });
    const taskIds = tasks.map(t => t.id.toString());
    return (
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy} id={id} >
            <div ref={setNodeRef} className="flex flex-col bg-gray-100/50 dark:bg-[#141824] rounded-xl p-4 min-h-[500px]">
                <h3 className={`text-[#1A202C] dark:text-white text-lg font-bold leading-tight px-2 pb-4 pt-0 border-b border-gray-300 dark:border-gray-700/50`}>
                    {title} ({tasks.length})
                </h3>
                <div className="flex flex-col gap-4 overflow-y-auto pt-4 flex-1">
                    {tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onTaskClick={onTaskClick} 
                        />
                    ))}
                    {tasks.length === 0 && (<p className="text-sm text-gray-500 dark:text-gray-600 text-center py-4">Bu sütunda görev yok.</p>)}
                </div>
            </div>
        </SortableContext>
    );
}
// --------------------------------------------------


function ProjectDetailPage() {
    const navigate = useNavigate();
    const { projectId } = useParams(); 
    
    // --- State'ler ---
    const [project, setProject] = useState(null); 
    const [tasks, setTasks] = useState([]);     
    const [error, setError] = useState(null); 
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [selectedTaskId, setSelectedTaskId] = useState(null); 
    
    // Sürükleme Sensörü (DÜZELTME: 'distance: 5' ayarı burada)
    // Tıklama (0px) ile Sürüklemeyi (5px+) ayırır
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { 
                distance: 5,
            },
        })
    );

    // --- Veri Çekme (useEffect 1: Proje Detayı) ---
    useEffect(() => {
        if (!projectId) return; 
        const fetchProjectDetails = async () => {
            setIsLoadingProject(true); 
            setError(null);
            try {
                const projectData = await projectService.getProjectById(projectId);
                setProject(projectData);
            } catch (err) {
                 console.error("Proje Detay çekme hatası:", err);
                 if ((err.response && err.response.status === 401) || !err.response) {
                    authService.logout(); navigate('/login');   
                 } else if (err.response && err.response.status === 403) {
                    setError("Bu projeyi görüntüleme yetkiniz yok.");
                 } else {
                    setError("Proje yüklenirken bir hata oluştu.");
                 }
            } finally {
                setIsLoadingProject(false); 
            }
        };
        fetchProjectDetails(); 
    }, [projectId, navigate, refreshTrigger]); 
    
    // --- Veri Çekme (useEffect 2: Görevler) ---
    useEffect(() => {
        if (!projectId) return; 
        const fetchTasks = async () => {
            setIsLoadingTasks(true);
            try {
                const tasksData = await taskService.getTasksForProject(projectId);
                setTasks(tasksData);
            } catch (err) {
                 console.error("Görevleri çekme hatası:", err);
                 if ((err.response && err.response.status === 401) || !err.response) {
                    authService.logout(); navigate('/login');
                 }
                 else if (err.response && err.response.status === 403) {
                     if (!error) setError("Görevleri görüntüleme yetkiniz yok.");
                 }
            } finally {
                setIsLoadingTasks(false);
            }
        };
        fetchTasks();
    }, [projectId, navigate, refreshTrigger]); 

    // --- Fonksiyonlar ---
    const handleLogout = () => { authService.logout(); navigate('/login'); };
    const handleDataChanged = () => { setRefreshTrigger(prev => prev + 1); };
    const findTaskById = (taskId) => { return tasks.find(task => task.id.toString() === taskId.toString()); };
    const handleTaskClick = (taskId) => { setSelectedTaskId(taskId); };
    const handleDetailModalClose = () => { setSelectedTaskId(null); };

    // --- SÜRÜKLEME BİTTİĞİNDE ÇALIŞAN ANA FONKSİYON (DÜZELTİLDİ) ---
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            console.log("Sürükleme hedefi (over) yok, iptal.");
            return; 
        }

        // Sürüklenen kartın ID'si ve verisi
        const activeId = active.id.toString();
        const activeTask = active.data.current?.task; // TaskCard'a eklediğimiz data

        if (!activeTask) {
            console.error("Sürüklenen görev (activeTask) verisi bulunamadı!");
            return;
        }
        
        // Bırakılan yerin ID'si
        const overId = over.id.toString();

        // Bırakılan yerin SÜTUN ID'sini (yani yeni status'u) bul
        let newStatus;
        
        // Bırakılan yer (over) bir SÜTUN mu? (KanbanColumn'a eklediğimiz 'data' sayesinde)
        if (over.data.current?.type === 'Column') {
            newStatus = overId; // Evet, ID'sini al (örn: "yapiliyor")
        } 
        // Bırakılan yer (over) bir KART mı? (TaskCard'a eklediğimiz 'data' sayesinde)
        else if (over.data.current?.type === 'Task') {
            newStatus = over.data.current.task.status; // Evet, o kartın 'status'unu al
        } 
        else {
             // 'useDroppable' kullandığımız için bu durum yaşanmamalı
             console.log("Geçersiz bırakma hedefi (Sütun veya Kart değil).");
             return; 
        }
        
        // Durum değişmedi mi?
        if (activeTask.status === newStatus) {
            console.log("Durum değişmedi, işlem yok.");
            return; 
        }

        // --- 1. Optimistic Update (Arayüzü Anında Güncelle) ---
        // (Videodaki "geri kayma" hatasını bu çözer)
        setTasks((prevTasks) => {
            return prevTasks.map(task => 
                task.id === activeTask.id 
                    ? { ...task, status: newStatus } // Durumu anında değiştir
                    : task
            );
        });

        // --- 2. API Güncellemesi (Arka Planda) ---
        taskService.updateTaskStatus(activeTask.id, newStatus)
            .then(() => {
                console.log(`API: Görev ${activeTask.id} durumu ${newStatus} olarak güncellendi.`);
            })
            .catch((err) => {
                // Hata oluşursa! Arayüzü eski haline geri al (Rollback)
                console.error("Görev durumu güncellenemedi:", err);
                setTasks((prevTasks) => {
                    return prevTasks.map(task => 
                        task.id === activeTask.id
                            ? { ...task, status: activeTask.status } // Orijinal status'a geri dön
                            : task
                    );
                });
                setError("Görev durumu güncellenemedi. Sayfayı yenileyin.");
            });
    };
    // --------------------------------------------------

    // --- İçeriği Gösterme Fonksiyonu (KANBAN) ---
    const renderKanbanContent = () => {
        const isLoading = isLoadingProject || isLoadingTasks;
        if (isLoading) return <div className="flex flex-1 items-center justify-center py-10"><p className="text-xl font-medium dark:text-white">Proje Yükleniyor...</p></div>;
        if (error) return <div className="flex flex-1 items-center justify-center py-10"><p className="text-xl font-medium text-red-500">{error}</p></div>;
        if (!project) return <div className="flex flex-1 items-center justify-center py-10"><p className="text-xl font-medium dark:text-white">Proje bulunamadı.</p></div>;

        const columns = [
            { title: "Beklemede", status: "beklemede" },
            { title: "Yapılıyor", status: "yapılıyor" },
            { title: "Tamamlandı", status: "tamamlandı" },
        ];
        
        return (
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {columns.map(column => (
                        // Yeni KanbanColumn bileşenini kullanıyoruz
                        <KanbanColumn
                            key={column.status}
                            id={column.status} // "beklemede", "yapiliyor" vb.
                            title={column.title}
                            // O sütuna ait görevleri filtreleyip gönder
                            tasks={tasks.filter(t => t.status === column.status)}
                            onTaskClick={handleTaskClick} 
                        />
                    ))}
                </div>
            </DndContext>
        );
    };
    
    // --- ANA JSX (Dashboard Layout'unu Kullanma) ---
    return (
        <>
            {/* Modallar */}
            <NewTaskModal
                show={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onTaskCreated={handleDataChanged} 
                projectId={projectId} 
                members={project?.memberships || []} 
            />
            <NewMemberModal
                show={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                onMemberAdded={handleDataChanged} 
                projectId={projectId}
            />
            <TaskDetailModal
                show={selectedTaskId !== null} 
                taskId={selectedTaskId}
                members={project?.memberships || []} 
                onClose={handleDetailModalClose}
                onTaskUpdated={handleDataChanged} 
                onTaskDeleted={handleDataChanged} 
            />
        
            <div className="flex h-screen w-full flex-row bg-background-light dark:bg-background-dark">
                
                {/* --- SideNavBar --- */}
                <aside className="flex h-full w-64 flex-shrink-0 flex-col bg-[#1A202C] p-4 text-gray-300">
                    <div className="flex flex-col gap-4"><div className="flex items-center gap-3 px-3 py-2"><div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMaQEOq8ZXnL4TNNc2M9HDqWC0UymPRVZTqc-y7GUqVYYpaMye5aYBVcigxuvtjmgquWhXPFsWvAVoVy1f20M9aQ9B3wj5SWOM0nzCV1y7KrWHvXrdRk4MBXga-QouQFeHlDgfejieT5kWfMzZJk3FOx2UIzoW1boU2xBkM9ufYCrSx1ZeMszeuGbF5MEYycngcjF8Zf1YE0MWEHuD3Z_j_wLfvgNZpKWj0IumpsrRt9cbXH39KOU08_4J8WdM5E3NWo_YLM-NmN5q")'}}></div><div className="flex flex-col"><h1 className="text-white text-base font-medium leading-normal">ProjectFlow</h1><p className="text-gray-400 text-sm font-normal leading-normal">SaaS</p></div></div><nav className="mt-6 flex flex-col gap-2"><Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/dashboard"><span className="material-symbols-outlined">folder</span> <p className="text-sm font-medium leading-normal">Projeler</p></Link><Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/tasks"><span className="material-symbols-outlined">checklist</span><p className="text-sm font-medium leading-normal">Görevler</p></Link><Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/settings"><span className="material-symbols-outlined">settings</span><p className="text-sm font-medium leading-normal">Ayarlar</p></Link></nav></div>
                </aside>
                
                {/* --- Ana İçerik --- */}
                <main className="flex h-full flex-1 flex-col overflow-y-auto">
                    
                    {/* --- TopNavBar --- */}
                    <header className="flex items-center justify-end whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-10 py-3">
                        <div className="flex items-center gap-4"><div className="flex items-center gap-3"><div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}></div><span className="text-sm font-medium text-gray-800 dark:text-gray-200">Kullanıcı Adı</span></div><button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90" onClick={handleLogout}><span className="truncate">Çıkış Yap</span></button></div>
                    </header>
                    
                    {/* --- Sayfa İçeriği --- */}
                    <div className="flex flex-1 flex-col p-6 lg:p-10">
                        
                        {/* Üst Başlık ve Butonlar (AYARLAR BUTONU SİLİNDİ) */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <h1 className="text-[#140d1b] dark:text-white text-4xl font-black leading-tight tracking-tight min-w-72">
                                {project?.name || (isLoadingProject ? "Yükleniyor..." : "Proje Bulunamadı")}
                            </h1>
                            <div className="flex gap-3 flex-wrap justify-start">
                                <button 
                                    className="flex items-center gap-2 min-w-[84px] max-w-[480px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 disabled:opacity-50"
                                    disabled={isLoadingProject || isLoadingTasks || !project} 
                                    onClick={() => setIsTaskModalOpen(true)} 
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    <span className="truncate">Yeni Görev Ekle</span>
                                </button>
                                <button 
                                    className="flex items-center gap-2 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    disabled={isLoadingProject || isLoadingTasks || !project}
                                    onClick={() => setIsMemberModalOpen(true)} 
                                >
                                    <span className="material-symbols-outlined">person_add</span>
                                    <span className="truncate">Üye Ekle</span>
                                </button>
                                {/* Ayarlar Butonu (Geri Alma sırasında silindi) */}
                            </div>
                        </div>
                        
                        {/* KANBAN Panosu */}
                        {renderKanbanContent()}

                    </div>
                </main>
            </div>
        </>
    );
}

export default ProjectDetailPage;