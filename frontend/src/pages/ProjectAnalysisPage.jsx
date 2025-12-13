import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Grafik kütüphanesi
import authService from '@/services/authService';
import projectService from '@/services/projectService';
import taskService from '@/services/taskService';
import userService from '@/services/userService';

function ProjectAnalysisPage() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    // --- State'ler ---
    const [userName, setUserName] = useState('Kullanıcı');
    const [project, setProject] = useState(null);
    
    // İstatistik State'leri
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0, progress: 0 });
    const [chartData, setChartData] = useState([]);
    
    // AI Analiz State'leri
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    // Renkler (Grafik için: Sarı, Mavi, Yeşil)
    const COLORS = ['#F59E0B', '#3B82F6', '#10B981']; 

    // --- Veri Çekme ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // 1. Kullanıcı Adı
                const user = await userService.getProfile();
                if (user.first_name) setUserName(`${user.first_name} ${user.last_name || ''}`);
                else setUserName(user.email);

                // 2. Proje Detayı
                const projectData = await projectService.getProjectById(projectId);
                setProject(projectData);

                // 3. Görevler ve İstatistik Hesaplama
                const tasksData = await taskService.getTasksForProject(projectId);
                
                const total = tasksData.length;
                const completed = tasksData.filter(t => t.status === 'tamamlandı').length;
                const pending = tasksData.filter(t => t.status === 'beklemede').length;
                const inProgress = tasksData.filter(t => t.status === 'yapılıyor').length;
                
                // İlerleme Yüzdesi
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

                setStats({ total, completed, pending, inProgress, progress });

                // Grafik Verisi
                setChartData([
                    { name: 'Beklemede', value: pending },
                    { name: 'Yapılıyor', value: inProgress },
                    { name: 'Tamamlandı', value: completed },
                ]);

            } catch (err) {
                console.error("Veri yükleme hatası:", err);
                if (err.response?.status === 401) {
                    authService.logout();
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [projectId, navigate]);

    // --- Fonksiyonlar ---
    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const handleAiAnalyze = async () => {
        setIsAiLoading(true);
        try {
            const result = await projectService.analyzeProject(projectId);
            setAiAnalysis(result.analysis);
        } catch (err) {
            alert("Yapay zeka analizi alınamadı. Yetkinizi kontrol edin (Sadece Adminler kullanabilir).");
        } finally {
            setIsAiLoading(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;

    return (
        <div className="flex h-screen w-full flex-row bg-gray-50 dark:bg-[#111827]">
            
            {/* Sidebar (Standart) */}
            <aside className="flex h-full w-64 flex-col bg-[#1A202C] p-4 text-gray-300">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMaQEOq8ZXnL4TNNc2M9HDqWC0UymPRVZTqc-y7GUqVYYpaMye5aYBVcigxuvtjmgquWhXPFsWvAVoVy1f20M9aQ9B3wj5SWOM0nzCV1y7KrWHvXrdRk4MBXga-QouQFeHlDgfejieT5kWfMzZJk3FOx2UIzoW1boU2xBkM9ufYCrSx1ZeMszeuGbF5MEYycngcjF8Zf1YE0MWEHuD3Z_j_wLfvgNZpKWj0IumpsrRt9cbXH39KOU08_4J8WdM5E3NWo_YLM-NmN5q")'}}></div>
                    <div className="flex flex-col">
                        <h1 className="text-white font-medium">ProjectFlow</h1>
                        <p className="text-xs text-gray-400">SaaS</p>
                    </div>
                </div>
                <nav className="mt-6 flex flex-col gap-2">
                    <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined">folder</span> Projeler
                    </Link>
                    <Link to="/tasks" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined">checklist</span> Görevler
                    </Link>
                    <Link to="/notes" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined">description</span> Notlar
                    </Link>
                </nav>
            </aside>

            {/* Ana İçerik */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                {/* Topbar */}
                <header className="flex justify-between items-center px-10 py-3 border-b bg-white dark:bg-[#1A202C] dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h2 className="text-xl font-bold dark:text-white">{project?.name} - Analiz Raporu</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="flex items-center gap-2 group">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 group-hover:ring-2 ring-primary transition-all" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}></div>
                            <span className="text-sm font-medium dark:text-white">{userName}</span>
                        </Link>
                        <button onClick={handleLogout} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Çıkış</button>
                    </div>
                </header>

                <div className="p-10 space-y-8">
                    
                    {/* 1. Üst Kartlar (İstatistikler) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-[#1F2937] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-500 text-sm font-medium">Toplam Görev</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.total}</p>
                        </div>
                        <div className="bg-white dark:bg-[#1F2937] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-500 text-sm font-medium">Tamamlanan</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
                        </div>
                        {/* İlerleme Çubuğu */}
                        <div className="bg-white dark:bg-[#1F2937] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 col-span-1 md:col-span-2 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-gray-500 text-sm font-medium">Proje İlerlemesi</p>
                                <span className="font-bold text-2xl text-primary">{stats.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div 
                                    className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${stats.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* 2. Grafik Alanı (Pie Chart) */}
                        <div className="bg-white dark:bg-[#1F2937] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
                            <h3 className="text-lg font-bold mb-4 dark:text-white w-full text-left">Görev Dağılımı</h3>
                            {stats.total > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#374151' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-10">
                                    <span className="material-symbols-outlined text-4xl text-gray-300">data_usage</span>
                                    <p className="text-gray-500 mt-2">Analiz edilecek görev bulunmuyor.</p>
                                </div>
                            )}
                        </div>

                        {/* 3. Yapay Zeka Alanı (Gemini Entegrasyonu) */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-[#1F2937] dark:to-[#111827] p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                                        <span className="material-symbols-outlined">smart_toy</span>
                                        AI Proje Danışmanı
                                    </h3>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">Google Gemini 2.0 tarafından desteklenmektedir</p>
                                </div>
                                <button 
                                    onClick={handleAiAnalyze}
                                    disabled={isAiLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    {isAiLoading ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                            Analiz Ediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                            Analiz Başlat
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2">
                                {!aiAnalysis && !isAiLoading && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-indigo-100 dark:border-gray-700 rounded-xl">
                                        <span className="material-symbols-outlined text-4xl text-indigo-200 mb-2">analytics</span>
                                        <p className="text-gray-500 font-medium">Henüz bir analiz yapılmadı.</p>
                                        <p className="text-sm text-gray-400 mt-1">Proje verilerini yapay zeka ile analiz etmek ve öneriler almak için butona tıklayın.</p>
                                    </div>
                                )}

                                {aiAnalysis && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-indigo-50 dark:border-gray-700">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-amber-500 text-sm">lightbulb</span>
                                                Durum Özeti
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{aiAnalysis.summary}</p>
                                        </div>
                                        
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-indigo-50 dark:border-gray-700">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-500 text-sm">task_alt</span>
                                                Aksiyon Önerileri
                                            </h4>
                                            <ul className="space-y-3">
                                                {aiAnalysis.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-bold mt-0.5">{i+1}</span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default ProjectAnalysisPage;