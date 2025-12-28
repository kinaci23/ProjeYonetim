import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import taskService from '@/services/taskService';

function MyTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyTasks = async () => {
            setIsLoading(true);
            try {
                const data = await taskService.getMyTasks();
                setTasks(data);
            } catch (error) {
                console.error("Görevler yüklenirken hata oluştu:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyTasks();
    }, []);

    // --- YARDIMCI FONKSİYONLAR ---

    // 1. Görevleri Projeye Göre Gruplama Fonksiyonu
    const groupTasksByProject = (taskList) => {
        const groups = {};
        taskList.forEach(task => {
            // Eğer proje verisi yoksa (eski veri vs.) 'Bilinmeyen' altına at
            const projectId = task.project ? task.project.id : 'unknown';
            const projectName = task.project ? task.project.name : 'Bilinmeyen Proje';
            
            if (!groups[projectId]) {
                groups[projectId] = {
                    id: projectId,
                    name: projectName,
                    tasks: []
                };
            }
            groups[projectId].tasks.push(task);
        });
        return Object.values(groups); // Diziye çevirip döndür
    };

    // 2. Öncelik Badge Renkleri
    const getPriorityBadge = (priority) => {
        const styles = {
            'Düşük': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            'Orta': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
            'Yüksek': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
            'Kritik': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[priority] || styles['Orta']}`}>
                {priority}
            </span>
        );
    };

    // 3. Durum Badge Renkleri
    const getStatusBadge = (status) => {
        const styles = {
            'beklemede': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            'yapılıyor': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'tamamlandı': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
        };
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
        return (
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${styles[status] || styles['beklemede']}`}>
                {displayStatus}
            </span>
        );
    };

    // 4. Tarih Formatlama
    const formatDate = (dateString, status) => {
        if (!dateString) return <span className="text-gray-400">-</span>;
        const date = new Date(dateString);
        const isOverdue = date < new Date() && status !== 'tamamlandı';
        
        return (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                <span className="material-symbols-outlined text-[16px]">event</span>
                {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </span>
        );
    };

    const groupedTasks = groupTasksByProject(tasks);

    return (
        <MainLayout>
            <div className="flex flex-col h-full p-6 lg:p-10 overflow-y-auto">
                {/* Sayfa Başlığı */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Görevlerim</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Projelerinize göre gruplanmış aktif görevleriniz.
                        </p>
                    </div>
                </div>

                {/* İçerik Alanı */}
                <div className="flex-1 pb-10">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
                                <span className="text-gray-500">Görevler yükleniyor...</span>
                            </div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white dark:bg-[#1A202C] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <span className="material-symbols-outlined text-6xl opacity-20 mb-4">assignment_turned_in</span>
                            <p className="text-lg font-medium">Harika! Şu an üzerinde çalıştığınız bir görev yok.</p>
                        </div>
                    ) : (
                        // GRUPLANMIŞ LİSTE
                        <div className="flex flex-col gap-8">
                            {groupedTasks.map((group) => (
                                <div key={group.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    
                                    {/* Proje Başlığı (Header) */}
                                    <div className="flex items-center gap-2 mb-3 pl-1">
                                        <span className="material-symbols-outlined text-indigo-500">folder_open</span>
                                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                            {group.name}
                                        </h2>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
                                            {group.tasks.length}
                                        </span>
                                    </div>

                                    {/* O Projeye Ait Görev Tablosu */}
                                    <div className="bg-white dark:bg-[#1A202C] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    {/* Proje sütununu kaldırdık */}
                                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-2/5">Görev Başlığı</th>
                                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Öncelik</th>
                                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bitiş Tarihi</th>
                                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">İşlem</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {group.tasks.map((task) => (
                                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                                    {task.title}
                                                                </span>
                                                                {task.description && (
                                                                    <span className="text-xs text-gray-500 truncate max-w-[300px] mt-0.5">
                                                                        {task.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            {getPriorityBadge(task.priority)}
                                                        </td>
                                                        <td className="p-4">
                                                            {getStatusBadge(task.status)}
                                                        </td>
                                                        <td className="p-4">
                                                            {formatDate(task.due_date, task.status)}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <Link 
                                                                to={`/projects/${group.id}`}
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                                                                title="Projeye Git"
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default MyTasksPage;