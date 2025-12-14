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

// --- YARDIMCI BİLEŞENLER (TaskCard, KanbanColumn) ---
// (Bu kısımlar değişmediği için kod kalabalığı yapmasın diye kısalttım, 
// ama sen dosyadaki TaskCard ve KanbanColumn fonksiyonlarını KORU veya tekrar ekle)
function TaskCard({ task, onTaskClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id.toString(), data: { type: 'Task', task: task } }); 
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1, zIndex: isDragging ? 100 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onTaskClick(task.id.toString())} className="block bg-white dark:bg-[#1A202C] rounded-lg p-4 shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <h4 className="font-bold text-[#1A202C] dark:text-white">{task.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description || "Açıklama girilmemiş."}</p>
            {task.due_date && <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Son Teslim: {new Date(task.due_date).toLocaleDateString('tr-TR')}</p>}
            <p className="text-xs text-primary mt-1">Atanan: {task.assignee_id ? `Kullanıcı ID ${task.assignee_id}` : 'Yok'}</p>
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
            <NewTaskModal show={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onTaskCreated={handleDataChanged} projectId={projectId} />
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
                        <button className="flex items-center gap-2 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50" disabled={isLoadingProject || isLoadingTasks || !project} onClick={() => setIsMemberModalOpen(true)}>
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