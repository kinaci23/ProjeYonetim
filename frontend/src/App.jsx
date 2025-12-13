import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; 
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'; 
import ProjectSettingsPage from './pages/ProjectSettingsPage.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';
import NotesPage from './pages/NotesPage.jsx';

// --- EKSİK OLAN IMPORT BURADA ---
import ProjectAnalysisPage from './pages/ProjectAnalysisPage.jsx'; 

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
        
        {/* Proje Detay */}
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

        {/* Proje Ayarları */}
        <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />

        {/* Profil Sayfası */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Notlar Sayfası */}
        <Route path="/notes" element={<NotesPage />} />

        {/* --- EKSİK OLAN ROTA BURADA --- */}
        <Route path="/projects/:projectId/analysis" element={<ProjectAnalysisPage />} />

      </Routes>
    </div>
  )
}

export default App;