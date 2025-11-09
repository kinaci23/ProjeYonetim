import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Çalışan import yöntemimiz:
// HATA DÜZELTMESİ: Dosya uzantılarını (.jsx) açıkça ekliyoruz
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; 
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'; 
import ProjectSettingsPage from './pages/ProjectSettingsPage.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';
// YENİ IMPORT (NOTLAR SAYFASI)
import NotesPage from './pages/NotesPage.jsx';

function App() {
  return (
    <div className="App w-full h-full">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Auth Sayfaları */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        
        {/* Ana Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Proje Detay (Trello Panosu) */}
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

        {/* Proje Ayarları Sayfası */}
        <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />

        {/* Profil Sayfası */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* YENİ EKLENEN YOL (NOTLAR SAYFASI) */}
        <Route path="/notes" element={<NotesPage />} />

      </Routes>
    </div>
  )
}

export default App;