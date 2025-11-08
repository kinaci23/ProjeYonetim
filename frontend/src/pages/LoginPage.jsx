import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Standart göreceli import yolu (RegisterPage'de çalışan yöntem)
import authService from '../services/authService'; 

function LoginPage() {
    // --- React State'leri ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // Göz ikonu için
    const navigate = useNavigate();

    // --- Giriş Fonksiyonu ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Giriş başarısız. Lütfen email ve şifrenizi kontrol edin.');
            console.error(err);
        }
    };

    // --- JSX (RegisterPage ile Tutarlı Tasarım) ---
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light p-4 dark:bg-background-dark">
            <div className="w-full max-w-md">
                {/* Kart Stili (RegisterPage'den alındı) */}
                <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900/50 dark:shadow-2xl dark:shadow-primary/20 sm:p-8 md:p-10">
                    <div className="flex flex-col items-center">
                        
                        {/* Başlık (RegisterPage ile tutarlı) */}
                        <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white pb-6 pt-2 text-center">
                            Giriş Yap
                        </h1>
                        
                        {/* Hata Mesajı Alanı */}
                        {error && (
                            <div className="mb-4 w-full rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <form className="flex w-full flex-col gap-y-5" onSubmit={handleLogin}>
                            
                            {/* --- Email (İkon Eklendi, Placeholder Değişti) --- */}
                            <label className="flex w-full flex-col">
                                <p className="text-[#111827] dark:text-gray-300 text-sm font-medium leading-normal pb-2">Email</p>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-4 text-gray-500 dark:text-gray-400">mail</span>
                                    <input 
                                        className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111827] dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary focus:ring-primary h-14 placeholder:text-[#6B7280] dark:placeholder:text-gray-500 p-3 pl-12 text-base font-normal leading-normal" 
                                        placeholder="E-posta adresiniz" 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </label>

                            {/* --- Şifre (İkon Eklendi, Placeholder Değişti) --- */}
                            <label className="flex w-full flex-col">
                                <p className="text-[#111827] dark:text-gray-300 text-sm font-medium leading-normal pb-2">Password</p>
                                <div className="relative flex w-full items-stretch">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">lock</span>
                                    <input 
                                        className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111827] dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary focus:ring-primary h-14 placeholder:text-[#6B7280] dark:placeholder:text-gray-500 p-3 pl-12 pr-10 text-base font-normal leading-normal" 
                                        placeholder="Şifreniz" 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div 
                                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center pr-3 text-slate-400 dark:text-slate-400"
                                        onClick={() => setShowPassword(!showPassword)} // Göz ikonu fonksiyonelliği
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </div>
                                </div>
                            </label>
                            
                            {/* --- Buton (Animasyon Eklendi) --- */}
                            <button 
                                className="flex h-12 w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark 
                                           transition-transform duration-200 hover:scale-105 active:scale-95" // Animasyon (Register ile aynı)
                                type="submit"
                            >
                                <span className="truncate">Giriş Yap</span>
                            </button>
                        </form>
                        
                        {/* --- Kayıt Ol Linki (Register ile tutarlı) --- */}
                        <p className="text-[#6B7280] dark:text-gray-400 text-sm font-normal leading-normal pt-6 text-center">
                            Hesabınız yok mu? <Link className="font-medium text-primary hover:underline" to="/register">Kayıt Olun</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;