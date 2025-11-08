import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Çalışan import yöntemimiz: göreceli yol ve uzantı YOK
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage'; 
import ProjectDetailPage from './pages/ProjectDetailPage'; 
// YENİ IMPORT (ADIM 7)
import ProjectSettingsPage from './pages/ProjectSettingsPage'; 

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