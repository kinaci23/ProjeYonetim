import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import projectService from '@/services/projectService';
import taskService from '@/services/taskService';
import userService from '@/services/userService';
import MainLayout from '@/components/MainLayout';

function ProjectAnalysisPage() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    // --- State'ler ---
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
        riskYuksek: '#EF4444',
        riskOrta: '#F59E0B',
        riskDusuk: '#10B981'
    };

    // --- Veri Çekme ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [projectData, tasksData] = await Promise.all([
                    projectService.getProjectById(projectId),
                    taskService.getTasksForProject(projectId)
                ]);

                setProject(projectData);

                // --- İstatistikler ---
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

                // İş Yükü Grafiği
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

    // --- AI Analiz İsteği ---
    const handleAiAnalyze = async () => {
        setIsAiLoading(true);
        try {
            const result = await projectService.analyzeProject(projectId);
            setAiAnalysis(result.analysis);
        } catch (err) {
            console.error(err);
            alert("AI Analizi başarısız. Lütfen daha sonra tekrar deneyin.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const getRiskColor = (score) => {
        if (score < 30) return COLORS.riskDusuk;
        if (score < 70) return COLORS.riskOrta;
        return COLORS.riskYuksek;
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#111827] text-gray-500">Yükleniyor...</div>;

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-6rem)] w-full p-4 lg:p-6 overflow-hidden gap-4">
                
                <div className="flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <Link to={`/projects/${projectId}`} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight flex items-center gap-2">
                                {project?.name}
                                <span className="text-xs font-normal text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">360° Analiz</span>
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-y-auto pb-10">
                    
                    {/* SOL: Grafikler (8/12) */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <p className="text-xs text-gray-500 font-bold uppercase">Toplam İş</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <p className="text-xs text-green-500 font-bold uppercase">Biten</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">{stats.completed}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                                <p className="text-xs text-red-500 font-bold uppercase">Riskli</p>
                                <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{stats.overdue}</p>
                            </div>
                            <div className="bg-white dark:bg-[#1F2937] p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <p className="text-xs text-indigo-500 font-bold uppercase">Başarı</p>
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">%{stats.progress}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                            <div className="bg-white dark:bg-[#1F2937] p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Ekip İş Yükü</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={workloadData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px', border:'none', backgroundColor:'#1F2937', color:'#fff'}} />
                                        <Bar dataKey="gorevSayisi" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white dark:bg-[#1F2937] p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Görev Dağılımı</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius:'8px', border:'none', backgroundColor:'#1F2937', color:'#fff'}} />
                                        <Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ: AI Panel (4/12) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-gradient-to-b from-indigo-900 to-[#111827] rounded-2xl shadow-xl border border-indigo-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                        <div className="p-6 border-b border-white/10 flex justify-between items-center z-10">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-400">psychology</span>
                                    AI Danışman
                                </h3>
                                <p className="text-xs text-indigo-300"></p>
                            </div>
                            <button onClick={handleAiAnalyze} disabled={isAiLoading} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50">
                                {isAiLoading ? <span className="animate-spin material-symbols-outlined">sync</span> : <span className="material-symbols-outlined">play_arrow</span>}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-thin scrollbar-thumb-white/20">
                            {!aiAnalysis ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-indigo-300 opacity-70">
                                    <span className="material-symbols-outlined text-5xl mb-4">analytics</span>
                                    <p>Yapay zeka analizi için<br/>butona tıklayın.</p>
                                </div>
                            ) : (
                                <>
                                    {/* SKOR KARTLARI (YENİ) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                            <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Risk Skoru</p>
                                            <div className="text-3xl font-black" style={{ color: getRiskColor(aiAnalysis.risk_score) }}>
                                                {aiAnalysis.risk_score}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                                            <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Performans</p>
                                            <div className="text-3xl font-black text-blue-400">
                                                {aiAnalysis.performance_score}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">summarize</span> Durum Özeti
                                        </h4>
                                        <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                            {aiAnalysis.summary}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">tips_and_updates</span> Aksiyon Planı
                                        </h4>
                                        {aiAnalysis.recommendations.map((rec, i) => (
                                            <div key={i} className="flex gap-3 text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                                <span className="font-bold text-indigo-400">{i+1}.</span>
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
        </MainLayout>
    );
}

export default ProjectAnalysisPage;