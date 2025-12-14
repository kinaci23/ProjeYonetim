import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import noteService from '@/services/noteService'; 

function NotesPage() {
    const navigate = useNavigate();

    const [notesList, setNotesList] = useState([]); 
    const [selectedNoteId, setSelectedNoteId] = useState(null); 
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
    const [isSaving, setIsSaving] = useState(false); 
    const [error, setError] = useState(null);

    // --- Veri Çekme ---
    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const data = await noteService.getAllNotes();
                setNotesList(data); 
                // Eğer not varsa ve hiçbiri seçili değilse opsiyonel olarak ilkini seçebilirsin:
                // if (data.length > 0) setSelectedNoteId(data[0].id);
            } catch (err) {
                console.error("Notlar yüklenemedi:", err);
                setError("Notlar yüklenirken bir hata oluştu.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, [navigate]);

    // --- Seçim Değişince Editörü Güncelle ---
    useEffect(() => {
        if (selectedNoteId === null) {
            setNoteTitle('');
            setNoteContent('');
            return;
        }
        const currentNote = notesList.find(note => note.id === selectedNoteId);
        if (currentNote) {
            setNoteTitle(currentNote.title);
            setNoteContent(currentNote.content || '');
        }
    }, [selectedNoteId, notesList]); 

    // --- Handler'lar ---
    const handleSelectNote = (noteId) => {
        setSelectedNoteId(prev => prev === noteId ? null : noteId);
    };

    const handleNewNote = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const newNote = await noteService.createNote({ title: 'Yeni Not', content: '' }); 
            setNotesList([newNote, ...notesList]);
            setSelectedNoteId(newNote.id);
        } catch (err) {
            setError("Yeni not oluşturulamadı.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedNoteId) return; 
        setIsSaving(true);
        try {
            const updatedNote = await noteService.updateNote(selectedNoteId, {
                title: noteTitle,
                content: noteContent
            });
            setNotesList(notesList.map(note => note.id === updatedNote.id ? updatedNote : note));
        } catch (err) {
            setError("Not kaydedilemedi.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNoteId) return;
        if (!window.confirm(`"${noteTitle}" notunu silmek istediğine emin misin?`)) return;
        setIsSaving(true);
        try {
            await noteService.deleteNote(selectedNoteId);
            setNotesList(notesList.filter(note => note.id !== selectedNoteId));
            setSelectedNoteId(null);
        } catch (err) {
            setError("Not silinemedi.");
        } finally {
            setIsSaving(false);
        }
    };

    // Tarih formatlayıcı (Opsiyonel: not listesinde tarih göstermek istersen)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <MainLayout>
            {/* Ana Kapsayıcı: Ekran yüksekliğine sabitlendi, böylece iç scroll çalışır */}
            <div className="flex flex-col h-[calc(100vh-6rem)] w-full p-4 lg:p-6 gap-4 overflow-hidden bg-gray-50 dark:bg-gray-900">
                
                {error && (
                    <div className="shrink-0 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                    </div>
                )}
                
                <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden min-h-0">
                    
                    {/* --- SOL SÜTUN: Not Listesi (Grid 4/12) --- */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col h-full bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        
                        {/* Liste Başlığı & Yeni Butonu */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">description</span>
                                    Notlar
                                </h1>
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{notesList.length}</span>
                            </div>
                            <button 
                                onClick={handleNewNote} 
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">add</span> Yeni Not Oluştur
                            </button>
                        </div>

                        {/* Liste İçeriği (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
                            {isLoading ? (
                                <div className="flex justify-center p-4"><span className="animate-spin material-symbols-outlined text-gray-400">sync</span></div>
                            ) : notesList.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl opacity-20">note_stack</span>
                                    <p className="text-sm mt-2">Henüz not yok.</p>
                                </div>
                            ) : (
                                notesList.map(note => (
                                    <button 
                                        key={note.id} 
                                        onClick={() => handleSelectNote(note.id)} 
                                        className={`w-full text-left p-3 rounded-lg group transition-all duration-200 border border-transparent
                                            ${selectedNoteId === note.id 
                                                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 shadow-sm' 
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-semibold text-sm truncate pr-2 ${selectedNoteId === note.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {note.title || "İsimsiz Not"}
                                            </p>
                                            {/* Tarih varsa buraya eklenebilir */}
                                            {/* <span className="text-[10px] text-gray-400">{formatDate(note.updated_at)}</span> */}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate opacity-80 group-hover:opacity-100">
                                            {note.content ? note.content.substring(0, 40) : "İçerik yok..."}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* --- SAĞ SÜTUN: Editör Alanı (Grid 8/12) --- */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full"> 
                        {selectedNoteId === null ? (
                            <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700 border-dashed text-gray-400">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">edit_note</span>
                                </div>
                                <p className="text-lg font-medium text-gray-500">Bir not seçin veya oluşturun</p>
                                <p className="text-sm mt-1 opacity-60">Düzenlemeye başlamak için soldaki listeyi kullanın.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                
                                {/* Editör Toolbar */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1F2937]">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Düzenleme Modu
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={handleDeleteNote} 
                                            disabled={isSaving}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Notu Sil"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                        <button 
                                            onClick={handleSaveNote} 
                                            disabled={isSaving}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 shadow-sm"
                                        >
                                            {isSaving ? (
                                                <><span className="animate-spin material-symbols-outlined text-base">sync</span> Kaydediliyor...</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-base">save</span> Kaydet</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Editör Input Alanları */}
                                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                                    <input 
                                        type="text" 
                                        placeholder="Not Başlığı" 
                                        value={noteTitle} 
                                        onChange={(e) => setNoteTitle(e.target.value)} 
                                        disabled={isSaving}
                                        className="w-full text-3xl font-bold text-gray-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300 mb-4"
                                    />
                                    <textarea 
                                        placeholder="Buraya yazmaya başlayın..." 
                                        value={noteContent} 
                                        onChange={(e) => setNoteContent(e.target.value)} 
                                        disabled={isSaving}
                                        className="flex-1 w-full text-base leading-relaxed text-gray-600 dark:text-gray-300 bg-transparent border-none p-0 focus:ring-0 resize-none placeholder-gray-300"
                                    ></textarea>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}

export default NotesPage;