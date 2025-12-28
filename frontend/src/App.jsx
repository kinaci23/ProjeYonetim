import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- YENİ IMPORT

import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; 
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'; 
import ProjectSettingsPage from './pages/ProjectSettingsPage.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import ProjectAnalysisPage from './pages/ProjectAnalysisPage.jsx'; 
import MyTasksPage from './pages/MyTasksPage.jsx';

function App() {
  return (
    <div className="App w-full h-full">
      {/* Toast Ayarları */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981', // Yeşil
            },
          },
          error: {
            style: {
              background: '#EF4444', // Kırmızı
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/projects/:projectId/analysis" element={<ProjectAnalysisPage />} />
        <Route path="/tasks" element={<MyTasksPage />} />
      </Routes>
    </div>
  )
}

export default App;