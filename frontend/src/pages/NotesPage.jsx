// frontend/src/pages/NotesPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import userService from '@/services/userService';
import noteService from '@/services/noteService'; 

function NotesPage() {
    const navigate = useNavigate();

    // --- State'ler (Fonksiyonellik için aynı kalıyor) ---
    const [userName, setUserName] = useState('Kullanıcı Adı'); 
    const [notesList, setNotesList] = useState([]); 
    const [selectedNoteId, setSelectedNoteId] = useState(null); 
    
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const [isLoading, setIsLoading] = useState(true); 
    const [isSaving, setIsSaving] = useState(false); 
    const [error, setError] = useState(null);

    // --- Veri Çekme: Topbar Kullanıcı Adı ---
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const userData = await userService.getProfile();
                if (userData.first_name && userData.last_name) {
                    setUserName(`${userData.first_name} ${userData.last_name}`);
                } else if (userData.first_name) {
                    setUserName(userData.first_name);
                } else {
                    setUserName(userData.email);
                }
            } catch (err) {
                console.error("Kullanıcı adı çekilemedi:", err);
                if (err.response && err.response.status === 401) {
                    authService.logout();
                    navigate('/login');
                }
            }
        };
        fetchUserName();
    }, [navigate]);

    // --- Veri Çekme: Kullanıcının Notları ---
    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const data = await noteService.getAllNotes();
                setNotesList(data); 
            } catch (err) {
                console.error("Notlar yüklenemedi:", err);
                if (err.response && err.response.status === 401) {
                    authService.logout();
                    navigate('/login');
                } else {
                    setError("Notlar yüklenirken bir hata oluştu.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, [navigate]);

    // --- Senkronizasyon: Formu Seçili Not ile Doldur ---
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

    // --- Fonksiyonlar (Tümü aynı kalıyor) ---
    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const handleSelectNote = (noteId) => {
        if (selectedNoteId === noteId) {
            setSelectedNoteId(null);
        } else {
            setSelectedNoteId(noteId);
        }
    };

    const handleNewNote = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const newNote = await noteService.createNote({}); 
            setNotesList([newNote, ...notesList]);
            setSelectedNoteId(newNote.id);
        } catch (err) {
            console.error("Yeni not oluşturulamadı:", err);
            setError("Yeni not oluşturulamadı. Lütfen tekrar deneyin.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedNoteId) return; 
        setIsSaving(true);
        setError(null);
        try {
            const updatedNote = await noteService.updateNote(selectedNoteId, {
                title: noteTitle,
                content: noteContent
            });
            setNotesList(notesList.map(note => 
                note.id === updatedNote.id ? updatedNote : note
            ));
        } catch (err) {
            console.error("Not güncellenemedi:", err);
            setError("Not kaydedilemedi. Lütfen tekrar deneyin.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNoteId) return;
        if (!window.confirm(`"${noteTitle}" başlıklı notu silmek istediğinizden emin misiniz?`)) {
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await noteService.deleteNote(selectedNoteId);
            setNotesList(notesList.filter(note => note.id !== selectedNoteId));
            setSelectedNoteId(null);
        } catch (err) {
            console.error("Not silinemedi:", err);
            setError("Not silinemedi. Lütfen tekrar deneyin.");
        } finally {
            setIsSaving(false);
        }
    };


    // --- ANA JSX (YENİ TASARIM BURADA) ---
    return (
        <div className="flex h-screen w-full flex-row bg-background-light dark:bg-background-dark">
            
            {/* 1. SideNavBar (Dokunulmadı) */}
            <aside className="flex h-full w-64 flex-shrink-0 flex-col bg-[#1A202C] p-4 text-gray-300">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div 
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
                            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMaQEOq8ZXnL4TNNc2M9HDqWC0UymPRVZTqc-y7GUqVYYpaMye5aYBVcigxuvtjmgquWhXPFsWvAVoVy1f20M9aQ9B3wj5SWOM0nzCV1y7KrWHvXrdRk4MBXga-QouQFeHlDgfejieT5kWfMzZJk3FOx2UIzoW1boU2xBkM9ufYCrSx1ZeMszeuGbF5MEYycngcjF8Zf1YE0MWEHuD3Z_j_wLfvgNZpKWj0IumpsrRt9cbXH39KOU08_4J8WdM5E3NWo_YLM-NmN5q")'}}
                        ></div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-medium leading-normal">ProjectFlow</h1>
                            <p className="text-gray-400 text-sm font-normal leading-normal">SaaS</p>
                        </div>
                    </div>
                    <nav className="mt-6 flex flex-col gap-2">
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/dashboard">
                            <span className="material-symbols-outlined">folder</span>
                            <p className="text-sm font-medium leading-normal">Projeler</p>
                        </Link>
                        <Link className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10" to="/tasks">
                            <span className="material-symbols-outlined">checklist</span>
                            <p className="text-sm font-medium leading-normal">Görevler</p>
                        </Link>
                        <Link className="flex items-center gap-3 rounded-lg bg-primary/30 px-3 py-2 text-white" to="/notes">
                            <span className="material-symbols-outlined fill">description</span>
                            <p className="text-sm font-medium leading-normal">Notlar</p>
                        </Link>
                    </nav>
                </div>
            </aside>
            
            {/* 2. Ana İçerik Alanı (Dokunulmadı) */}
            <main className="flex h-full flex-1 flex-col overflow-y-auto">
                
                {/* 3. TopNavBar (Dokunulmadı) */}
                <header className="flex items-center justify-end whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-10 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex-shrink-0">
                                <div 
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hover:ring-2 hover:ring-primary hover:ring-offset-2 dark:hover:ring-offset-background-dark transition-all" 
                                    style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIKaMVIy_vHJrmeXzOgXNEwAjF_R8RhlC7X266Ixi69gQ6R3OGJFa98odvapm0SkDjpbztSGn03fsEBUyPPbm2GEwWda0KS94y_BxI-IMUwZmsbB1ABcz7nYt_abpf8Lsgy8imcm54lgWFptL5FtcfN0gU7Moo3oJ3_P4ADt1D3A5AetUcdaAwusWyKSxtbvnk_ldGVSiJcCBXt9hzW_USM3spsi8_c-LnOVL7aKxEz0DxXnanGK3PRoT0EMH0isCTXWT4Hl3vhk3R")'}}
                                ></div> 
                            </Link>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userName}</span>
                        </div> 
                        <button 
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90"
                            onClick={handleLogout}
                        >
                            <span className="truncate">Çıkış Yap</span>
                        </button>
                    </div>
                </header>
                
                {/* 4. Sayfa İçeriği (YENİ TASARIM) 
                   - "Tek sayfa" (scroll'suz) olması için overflow-hidden ve flex-1 kullandık
                */}
                <div className="flex flex-1 flex-col p-6 lg:p-10 overflow-hidden"> 
                    
                    {/* Hata Mesajı Alanı */}
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>
                    )}
                    
                    {/* Ana Izgara (2 Sütun) - Kalan yüksekliği doldurur */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 overflow-hidden">
                        
                        {/* Sol Sütun: Not Listesi (Master) */}
                        <div className="flex flex-col col-span-1 md:w-full max-w-sm overflow-hidden"> 
                            <h1 className="text-4xl font-black leading-tight tracking[-0.033em] text-[#140d1b] dark:text-white mb-6">Kişisel Notlarım</h1>
                            <button 
                                className="flex w-full items-center gap-2 justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 disabled:opacity-50"
                                onClick={handleNewNote}
                                disabled={isSaving}
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                <span className="truncate">Yeni Not Oluştur</span>
                            </button>
                            
                            {/* Not Listesi (Kendi içinde scroll olur) */}
                            <div className="flex-1 overflow-y-auto mt-6 space-y-2 pr-2">
                                {isLoading && <p className="text-center text-gray-500 p-4">Yükleniyor...</p>}
                                
                                {!isLoading && notesList.length === 0 && (
                                    <p className="text-center text-gray-500 p-4">Henüz notunuz yok.</p>
                                )}

                                {/* Resimdeki gibi başlık + içerik önizlemesi */}
                                {notesList.map(note => (
                                    <button 
                                        key={note.id}
                                        onClick={() => handleSelectNote(note.id)}
                                        className={`w-full text-left p-4 rounded-lg block transition-colors ${
                                            selectedNoteId === note.id 
                                            ? 'bg-primary/10 dark:bg-primary/20' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <p className={`font-semibold truncate ${selectedNoteId === note.id ? 'text-primary dark:text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {note.title || "İsimsiz Not"}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                            {note.content || "İçerik yok..."}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sağ Sütun: Not Düzenleyici (Detail) */}
                        <div className="col-span-1 md:col-span-2 h-full overflow-hidden"> 
                            {selectedNoteId === null && (
                                <div className="flex-1 h-full flex items-center justify-center bg-white dark:bg-[#1A202C] rounded-xl border border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500">Görüntülemek için bir not seçin veya yeni bir not oluşturun.</p>
                                </div>
                            )}

                            {selectedNoteId !== null && (
                                // Resimdeki gibi tek bir beyaz kart
                                <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A202C]">
                                    {/* Form Alanları (Kendi içinde scroll olur) */}
                                    <div className="p-8 flex-1 flex flex-col gap-4 overflow-y-auto">
                                        {/* Başlık Input - Resimdeki gibi büyük başlık */}
                                        <input 
                                            type="text"
                                            placeholder="Not Başlığı"
                                            value={noteTitle}
                                            onChange={(e) => setNoteTitle(e.target.value)}
                                            disabled={isSaving}
                                            className="form-input border-0 p-0 text-3xl font-bold text-[#140d1b] dark:text-white bg-transparent focus:outline-none focus:ring-0"
                                        />
                                        {/* İçerik Textarea - Resimdeki gibi normal metin */}
                                        <textarea
                                            placeholder="Notunuzu buraya yazın..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            disabled={isSaving}
                                            className="form-textarea flex-1 w-full border-0 p-0 text-gray-700 dark:text-gray-300 bg-transparent focus:outline-none focus:ring-0 resize-none text-base leading-relaxed"
                                        ></textarea>
                                    </div>

                                    {/* Buton Alanı (Aşağı sabitlenmiş) */}
                                    <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                        {/* Sil Butonu (Resimdeki gibi kırmızı link) */}
                                        <button 
                                            className="text-red-600 dark:text-red-500 hover:underline text-sm font-bold disabled:opacity-50"
                                            onClick={handleDeleteNote}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? "Siliniyor..." : "Sil"}
                                        </button>
                                        {/* Kaydet Butonu (Resimdeki gibi mor buton) */}
                                        <button 
                                            className="flex rounded-lg h-10 bg-primary text-white text-sm font-bold px-6 items-center justify-center disabled:opacity-50 transition-transform duration-200 hover:scale-105 active:scale-95"
                                            onClick={handleSaveNote}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default NotesPage;