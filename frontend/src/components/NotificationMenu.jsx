import React, { useState, useEffect, useRef } from 'react';
import notificationService from '@/services/notificationService';
import toast from 'react-hot-toast';

function NotificationMenu() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef(null);

    // Bildirimleri Çek
    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Bildirim hatası", error);
        }
    };

    // İlk açılışta ve periyodik olarak (her 30 sn) kontrol et
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Dışarı tıklayınca kapatma
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkRead = async (notif) => {
        if (!notif.is_read) {
            try {
                await notificationService.markRead(notif.id);
                // State güncelle (tekrar fetch atmadan hızlıca)
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success("Tümü okundu işaretlendi");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Zil Butonu */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
                <span className="material-symbols-outlined text-[26px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-[#1A202C]"></span>
                    </span>
                )}
            </button>

            {/* Dropdown Menü */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1A202C] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-primary font-medium hover:underline">
                                Tümünü Okundu Yap
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl opacity-30 mb-2">notifications_off</span>
                                <p className="text-sm">Henüz bildiriminiz yok.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => handleMarkRead(notif)}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors flex gap-3 ${!notif.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-primary' : 'bg-transparent'}`}></div>
                                        <div>
                                            <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-2">
                                                {new Date(notif.created_at).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationMenu;