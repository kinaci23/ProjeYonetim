import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Çalışan import yöntemimiz: göreceli yol ve uzantı YOK
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage'; 
import ProjectDetailPage from './pages/ProjectDetailPage'; 
// ProjectSettingsPage import'u SİLİNDİ

function App() {
  return (
    <div className="App w-full h-full">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        {/* ProjectSettingsPage yolu SİLİNDİ */}
      </Routes>
    </div>
  )
}
export default App;