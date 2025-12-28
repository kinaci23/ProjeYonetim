import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom'; 
import MainLayout from '@/components/MainLayout';
import projectService from '@/services/projectService'; 
import taskService from '@/services/taskService'; 
import NewTaskModal from '@/components/NewTaskModal';
import NewMemberModal from '@/components/NewMemberModal'; 
import TaskDetailModal from '@/components/TaskDetailModal';

// DND-KIT Importları
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- GÜNCELLENMİŞ TASK KART BİLEŞENİ ---
function TaskCard({ task, onTaskClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id.toString(), data: { type: 'Task', task: task } }); 
    
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 100 : 1 };

    // Öncelik Renkleri
    const priorityColors = {
        'Düşük': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Orta': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Yüksek': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Kritik': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onTaskClick(task.id.toString())} 
            className="group relative flex flex-col gap-3 bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700/50 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200">
            
            {/* Üst Etiketler (Category & Priority) */}
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                    {task.category || 'GENEL'}
                </span>
                {task.priority && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {task.priority}
                    </span>
                )}
            </div>

            {/* Başlık */}
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-snug line-clamp-2">
                {task.title}
            </h4>

            {/* Alt Bilgiler (Puan & Tarih & Atanan) */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                
                {/* Sol: Efor Puanı */}
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400" title="Efor Puanı">
                    <span className="material-symbols-outlined text-[16px]">fitness_center</span>
                    <span className="text-xs font-bold">{task.story_points || 1}</span>
                </div>

                {/* Orta: Tarih (Varsa) */}
                {task.due_date && (
                    <div className={`flex items-center gap-1 text-xs ${new Date(task.due_date) < new Date() ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        <span className="material-symbols-outlined text-[16px]">event</span>
                        <span>{new Date(task.due_date).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short'})}</span>
                    </div>
                )}

                {/* Sağ: Avatar (Varsa) */}
                {task.assignee_id ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold border border-white dark:border-gray-800 ring-1 ring-gray-100 dark:ring-gray-700">
                        ID{task.assignee_id}
                    </div>
                ) : (
                    <span className="material-symbols-outlined text-gray-300 text-[20px]">account_circle</span>
                )}
            </div>
        </div>
    );
}

function KanbanColumn({ id, title, tasks, onTaskClick }) {
    const { setNodeRef } = useDroppable({ id: id, data: { type: 'Column' } });
    const taskIds = tasks.map(t => t.id.toString());
    return (
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy} id={id}>
            <div ref={setNodeRef} className="flex flex-col bg-gray-100/50 dark:bg-[#141824] rounded-xl p-4 min-h-[500px]">
                <h3 className={`text-[#1A202C] dark:text-white text-lg font-bold leading-tight px-2 pb-4 pt-0 border-b border-gray-300 dark:border-gray-700/50`}>{title} ({tasks.length})</h3>
                <div className="flex flex-col gap-4 overflow-y-auto pt-4 flex-1">
                    {tasks.map(task => <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />)}
                    {tasks.length === 0 && (<p className="text-sm text-gray-500 dark:text-gray-600 text-center py-4">Bu sütunda görev yok.</p>)}
                </div>
            </div>
        </SortableContext>
    );
}

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
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        if (!projectId) return; 
        const fetchProjectDetails = async () => {
            setIsLoadingProject(true); 
            setError(null);
            try {
                const projectData = await projectService.getProjectById(projectId);
                setProject(projectData);
            } catch (err) {
                 console.error("Proje Detay hatası:", err);
                 if (err.response && err.response.status === 403) setError("Bu projeyi görüntüleme yetkiniz yok.");
                 else setError("Proje yüklenirken bir hata oluştu.");
            } finally {
                setIsLoadingProject(false); 
            }
        };
        fetchProjectDetails(); 
    }, [projectId, navigate, refreshTrigger]); 
    
    useEffect(() => {
        if (!projectId) return; 
        const fetchTasks = async () => {
            setIsLoadingTasks(true);
            try {
                const tasksData = await taskService.getTasksForProject(projectId);
                setTasks(tasksData);
            } catch (err) {
                 console.error("Görev hatası:", err);
            } finally {
                setIsLoadingTasks(false);
            }
        };
        fetchTasks();
    }, [projectId, navigate, refreshTrigger]); 

    const handleDataChanged = () => { setRefreshTrigger(prev => prev + 1); };
    const handleTaskClick = (taskId) => { setSelectedTaskId(taskId); };
    const handleDetailModalClose = () => { setSelectedTaskId(null); };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return; 
        const activeTask = active.data.current?.task; 
        if (!activeTask) return;
        const overId = over.id.toString();
        let newStatus;
        if (over.data.current?.type === 'Column') newStatus = overId; 
        else if (over.data.current?.type === 'Task') newStatus = over.data.current.task.status; 
        else return;
        
        if (activeTask.status === newStatus) return; 

        setTasks((prevTasks) => prevTasks.map(task => task.id === activeTask.id ? { ...task, status: newStatus } : task));
        taskService.updateTaskStatus(activeTask.id, newStatus).catch((err) => {
                console.error("Görev durumu güncellenemedi:", err);
                setTasks((prevTasks) => prevTasks.map(task => task.id === activeTask.id ? { ...task, status: activeTask.status } : task));
                setError("Görev durumu güncellenemedi. Sayfayı yenileyin.");
            });
    };

    const renderKanbanContent = () => {
        const isLoading = isLoadingProject || isLoadingTasks;
        if (isLoading) return <div className="flex flex-1 items-center justify-center py-10"><p className="text-xl font-medium dark:text-white">Proje Yükleniyor...</p></div>;
        if (error) return <div className="flex flex-1 items-center justify-center py-10"><p className="text-xl font-medium text-red-500">{error}</p></div>;
        if (!project) return <div className="flex flex-1 items-center justify-center py-10"><p className="text-xl font-medium dark:text-white">Proje bulunamadı.</p></div>;

        const columns = [{ title: "Beklemede", status: "beklemede" }, { title: "Yapılıyor", status: "yapılıyor" }, { title: "Tamamlandı", status: "tamamlandı" }];
        
        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {columns.map(column => <KanbanColumn key={column.status} id={column.status} title={column.title} tasks={tasks.filter(t => t.status === column.status)} onTaskClick={handleTaskClick} />)}
                </div>
            </DndContext>
        );
    };
    
    return (
        <MainLayout>
            <NewTaskModal show={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onTaskCreated={handleDataChanged} projectId={projectId} members={project?.memberships || []} />
            <NewMemberModal show={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onMemberAdded={handleDataChanged} projectId={projectId}/>
            <TaskDetailModal show={selectedTaskId !== null} taskId={selectedTaskId} members={project?.memberships || []} onClose={handleDetailModalClose} onTaskUpdated={handleDataChanged} onTaskDeleted={handleDataChanged} />
        
            <div className="flex flex-1 flex-col p-6 lg:p-10 overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <h1 className="text-[#140d1b] dark:text-white text-3xl font-black leading-tight tracking-tight min-w-72">
                        {project?.name || (isLoadingProject ? "..." : "Proje Bulunamadı")}
                    </h1>
                    <div className="flex gap-3 flex-wrap justify-start">
                        <Link to={`/projects/${projectId}/analysis`} className="flex items-center gap-2 min-w-[40px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors" title="Analiz">
                            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">analytics</span>
                        </Link>
                        <button className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50" disabled={isLoadingProject || isLoadingTasks || !project} onClick={() => setIsTaskModalOpen(true)}>
                            <span className="material-symbols-outlined">add_circle</span> <span>Görev Ekle</span>
                        </button>
                        <button className="flex items-center gap-2 min-w-[84px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50" disabled={isLoadingProject || isLoadingTasks || !project} onClick={() => setIsMemberModalOpen(true)}>
                            <span className="material-symbols-outlined">person_add</span> <span>Üye Ekle</span>
                        </button>
                        <Link to={`/projects/${projectId}/settings`} className={`flex items-center gap-2 min-w-[40px] cursor-pointer justify-center overflow-hidden rounded-lg h-10 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${(isLoadingProject || !project) ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span className="material-symbols-outlined">settings</span>
                        </Link>
                    </div>
                </div>
                {renderKanbanContent()}
            </div>
        </MainLayout>
    );
}

export default ProjectDetailPage;