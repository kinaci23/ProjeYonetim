import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Çalışan import yöntemimiz:
// HATA DÜZELTMESİ: Dosya uzantılarını (.jsx) açıkça ekliyoruz
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; 
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'; 
// YENİ IMPORT (ADIM 7)
import ProjectSettingsPage from './pages/ProjectSettingsPage.jsx'; 

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

        {/* YENİ EKLENEN YOL (ADIM 7) */}
        {/* Proje Ayarları Sayfası */}
        <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />

      </Routes>
    </div>
  )
}

export default App;