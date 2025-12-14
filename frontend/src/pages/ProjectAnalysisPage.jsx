import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import projectService from '@/services/projectService';
import taskService from '@/services/taskService';
import userService from '@/services/userService';
import authService from '@/services/authService';
import MainLayout from '../components/MainLayout'; // <-- 1. MainLayout İmport Edildi

function ProjectAnalysisPage() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    // --- State'ler (Aynen Korundu) ---
    const [userName, setUserName] = useState('Kullanıcı');
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, progress: 0 });
    const [pieData, setPieData] = useState([]);
    const [workloadData, setWorkloadData] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Renk Paleti
    const COLORS = {
        beklemede: '#F59E0B', 
        yapiliyor: '#3B82F6', 
        tamamlandi: '#10B981', 
        gecikmis: '#EF4444',
        bos: '#E5E7EB'
    };

    // --- Veri Çekme (Aynen Korundu) ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [userData, projectData, tasksData] = await Promise.all([
                    userService.getProfile(),
                    projectService.getProjectById(projectId),
                    taskService.getTasksForProject(projectId)
                ]);

                if (userData.first_name) setUserName(`${userData.first_name} ${userData.last_name || ''}`);
                else setUserName(userData.email);

                setProject(projectData);

                // --- HESAPLAMALAR ---
                const total = tasksData.length;
                const completed = tasksData.filter(t => t.status === 'tamamlandı').length;
                const pending = tasksData.filter(t => t.status === 'beklemede').length;
                const inProgress = tasksData.filter(t => t.status === 'yapılıyor').length;
                
                const now = new Date();
                const overdue = tasksData.filter(t => {
                    if (!t.due_date || t.status === 'tamamlandı') return false;
                    return new Date(t.due_date) < now;
                }).length;
                
                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

                setStats({ total, completed, pending, inProgress, overdue, progress });

                setPieData([
                    { name: 'Beklemede', value: pending, color: COLORS.beklemede },
                    { name: 'Yapılıyor', value: inProgress, color: COLORS.yapiliyor },
                    { name: 'Tamamlandı', value: completed, color: COLORS.tamamlandi },
                ]);

                const memberMap = {};
                projectData.memberships.forEach(m => {
                    const name = m.user.first_name 
                        ? `${m.user.first_name} ${m.user.last_name || ''}`.trim() 
                        : m.user.email.split('@')[0];
                    memberMap[m.user.id] = name;
                });

                const workloadCounts = {};
                tasksData.forEach(t => {
                    const assigneeId = t.assignee_id || 'atanmamis';
                    if (!workloadCounts[assigneeId]) workloadCounts[assigneeId] = 0;
                    workloadCounts[assigneeId]++;
                });

                const workloadChartData = Object.keys(workloadCounts).map(userId => {
                    return {
                        name: userId === 'atanmamis' ? 'Atanmamış' : (memberMap[userId] || 'Bilinmeyen'),
                        gorevSayisi: workloadCounts[userId]
                    };
                });
                
                setWorkloadData(workloadChartData);

            } catch (err) {
                console.error("Veri hatası:", err);
                if (err.response && err.response.status === 403) {
                    alert("Yetkisiz erişim.");
                    navigate('/dashboard');
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [projectId, navigate]);

    // --- AI Analiz Fonksiyonu ---
    const handleAiAnalyze = async () => {
        setIsAiLoading(true);
        try {
            const result = await projectService.analyzeProject(projectId);
            setAiAnalysis(result.analysis);
        } catch (err) {
            alert("AI Analizi başarısız.");
        } finally {
            setIsAiLoading(false);
        }
    };

    // handleLogout fonksiyonunu kaldırdım çünkü artık MainLayout içindeki Header bu işi yapmalı.

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#111827] text-gray-500">Yükleniyor...</div>;

    return (
        <MainLayout>
            {/* Main Container
                h-[calc(100vh-2rem)] veya benzeri bir yükseklik ayarı, 
                ekranın taşmasını engelleyip dashboard hissi verir.
            */}
            <div className="flex flex-col h-[calc(100vh-6rem)] w-full p-4 lg:p-6 overflow-hidden gap-4">
                
                {/* --- Sayfa İçi Header (Breadcrumb & Başlık) --- */}
                <div className="flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                                {project?.name}
                                <span className="text-xs font-normal text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">Analiz</span>
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Canlı Veri Akışı</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Dashboard Grid (Mevcut Yapı Korundu) --- */}
                <div className="flex-1 min-h-0">
                    <div className="grid grid-cols-12 grid-rows-[auto_1fr] gap-4 h-full">
                        
                        {/* 1. SATIR: KPI Kartları (4 Kolonlu) */}
                        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 h-auto shrink-0">
                            {/* KPI 1: Toplam */}
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Toplam Görev</p>
                                    <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-md text-lg">assignment</span>
                                </div>
                                <p className="text-2xl lg:text-3xl font-black text-gray-800 dark:text-white mt-2">{stats.total}</p>
                            </div>
                            
                            {/* KPI 2: Tamamlanan */}
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Tamamlanan</p>
                                    <span className="material-symbols-outlined text-green-500 bg-green-50 dark:bg-green-900/30 p-1 rounded-md text-lg">check_circle</span>
                                </div>
                                <p className="text-2xl lg:text-3xl font-black text-gray-800 dark:text-white mt-2">{stats.completed}</p>
                            </div>
                            
                            {/* KPI 3: Risk (Gecikmiş) */}
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                                <div className="flex justify-between items-start z-10">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Gecikmiş (Risk)</p>
                                    <span className="material-symbols-outlined text-red-500 bg-red-50 dark:bg-red-900/30 p-1 rounded-md text-lg">warning</span>
                                </div>
                                <p className="text-2xl lg:text-3xl font-black text-red-600 dark:text-red-400 z-10 mt-2">{stats.overdue}</p>
                            </div>
                            
                            {/* KPI 4: İlerleme */}
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">İlerleme</p>
                                    <span className={`font-bold text-lg ${stats.progress === 100 ? 'text-green-600' : 'text-indigo-600'}`}>%{stats.progress}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-1000 ${stats.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${stats.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. SATIR: Grafikler ve AI (Split View) */}
                        
                        {/* SOL SÜTUN: Grafikler (Grid 8/12) */}
                        <div className="col-span-12 lg:col-span-8 grid grid-rows-2 gap-4 min-h-0">
                            
                            {/* Üst Grafik: İş Yükü (Bar) */}
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-0">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-gray-400">bar_chart</span>
                                    Ekip İş Yükü
                                </h3>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="gorevSayisi" name="Görev" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Alt Grafik: Durum Dağılımı (Pie) */}
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col min-h-0">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-gray-400">pie_chart</span>
                                    Görev Durumları
                                </h3>
                                <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                                    {stats.total > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={40} outerRadius={60}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} itemStyle={{ fontSize: '12px' }} />
                                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-gray-400 text-sm">Veri yok</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SAĞ SÜTUN: AI Asistan (Grid 4/12) - Tam Yükseklik */}
                        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-[#1F2937] dark:to-[#111827] rounded-xl shadow-lg p-1 flex flex-col overflow-hidden">
                            <div className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg flex flex-col overflow-hidden">
                                
                                {/* AI Header */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shrink-0">
                                    <div>
                                        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                                            <span className="material-symbols-outlined">smart_toy</span>
                                            AI Danışman
                                        </h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">GEMINI 2.5 ANALIZI</p>
                                    </div>
                                    <button 
                                        onClick={handleAiAnalyze}
                                        disabled={isAiLoading}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-md transition-all disabled:opacity-50"
                                        title="Yeniden Analiz Et"
                                    >
                                        {isAiLoading ? <span className="animate-spin material-symbols-outlined text-lg">sync</span> : <span className="material-symbols-outlined text-lg">auto_awesome</span>}
                                    </button>
                                </div>

                                {/* AI Content (Scrollable Area) */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-gray-600">
                                    {!aiAnalysis ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                            <span className="material-symbols-outlined text-5xl mb-2 text-indigo-300">analytics</span>
                                            <p className="text-sm font-medium">Analiz bekliyor...</p>
                                            <p className="text-xs mt-1">Butona tıklayarak yapay zeka raporunu oluşturun.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Özet */}
                                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-400">
                                                <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-base">lightbulb</span> Durum Özeti
                                                </h4>
                                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.summary}</p>
                                            </div>

                                            {/* Öneriler Listesi */}
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-1 sticky top-0 bg-white/95 dark:bg-gray-800/95 py-2 z-10">
                                                    <span className="material-symbols-outlined text-base text-green-500">task_alt</span> Aksiyon Planı
                                                </h4>
                                                {aiAnalysis.recommendations.map((rec, i) => (
                                                    <div key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-2 rounded border border-gray-100 dark:border-gray-700">
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{i+1}.</span>
                                                        <span>{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default ProjectAnalysisPage;