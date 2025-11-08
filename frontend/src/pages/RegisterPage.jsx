import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Standart göreceli import yolu (LoginPage ile aynı)
import authService from '../services/authService'; 

function RegisterPage() {
    // --- React State'leri ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // Göz ikonu için
    const navigate = useNavigate();

    // --- Kayıt Fonksiyonu ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await authService.register(email, password);
            setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => {
                navigate('/login');
            }, 2000); // 2 saniye sonra yönlendir
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                // Backend'den gelen hata (örn: Email kullanımda)
                setError(err.response.data.detail);
            } else {
                setError('Kayıt başarısız. Lütfen tekrar deneyin.');
            }
            console.error(err);
        }
    };

    // --- JSX (LoginPage ile Tutarlı Tasarım) ---
    return (
        // Arkaplan ve ortalama
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light p-4 dark:bg-background-dark">
            <div className="w-full max-w-md">
                {/* Kart Stili */}
                <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900/50 dark:shadow-2xl dark:shadow-primary/20 sm:p-8 md:p-10">
                    <div className="flex flex-col items-center">
                        
                        {/* Başlık */}
                        <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white pb-6 pt-2 text-center">
                            Kayıt Ol
                        </h1>

                        {/* Hata ve Başarı Mesajları (LoginPage ile tutarlı) */}
                        {error && (
                            <div className="mb-4 w-full rounded-lg border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 w-full rounded-lg border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
                                {success}
                            </div>
                        )}
                        
                        <form className="flex w-full flex-col gap-5" onSubmit={handleRegister}>
                            
                            {/* --- Email --- */}
                            <div className="flex flex-col">
                                <label className="text-[#111827] dark:text-gray-300 text-sm font-medium leading-normal pb-2" htmlFor="email">Email</label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-4 text-gray-500 dark:text-gray-400">mail</span>
                                    <input 
                                        className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111827] dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary focus:ring-primary h-14 placeholder:text-[#6B7280] dark:placeholder:text-gray-500 p-3 pl-12 text-base font-normal leading-normal" 
                                        id="email" 
                                        placeholder="E-posta adresiniz" 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* --- Şifre --- */}
                            <div className="flex flex-col">
                                <label className="text-[#111827] dark:text-gray-300 text-sm font-medium leading-normal pb-2" htmlFor="password">Password</label>
                                <div className="relative flex w-full items-stretch rounded-lg">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">lock</span>
                                    <input 
                                        className="form-input flex w-full resize-none overflow-hidden rounded-lg text-[#111827] dark:text-white border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark focus:border-primary focus:ring-primary h-14 placeholder:text-[#6B7280] dark:placeholder:text-gray-500 p-3 pl-12 pr-12 text-base font-normal leading-normal" 
                                        id="password" 
                                        placeholder="Şifreniz" 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        className="absolute right-0 top-0 flex h-full items-center justify-center px-4 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary" 
                                        type="button" // Formu göndermemesi için
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* --- Buton (Animasyon LoginPage ile aynı) --- */}
                            <div className="flex pt-4">
                                <button 
                                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] 
                                               transition-transform duration-200 hover:scale-105 active:scale-95" // Animasyon
                                    type="submit"
                                >
                                    <span className="truncate">Kayıt Ol</span>
                                </button>
                            </div>
                        </form>
                        
                        {/* --- Giriş Yap Linki --- */}
                        <p className="text-[#6B7280] dark:text-gray-400 text-sm font-normal leading-normal pt-6 text-center">
                            Zaten bir hesabınız var mı? <Link className="font-medium text-primary hover:underline" to="/login">Giriş Yapın</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;