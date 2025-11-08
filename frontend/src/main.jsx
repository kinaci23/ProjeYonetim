// frontend/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // App.jsx'i import ediyoruz
import './index.css' // CSS stilleri (varsa)

// React Router'ı import ediyoruz
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Tüm uygulamayı BrowserRouter ile sarmalıyoruz */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)