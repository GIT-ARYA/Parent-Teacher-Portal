// client/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Messages from './pages/Messages';
import { AuthProvider } from './context/AuthContext';
import Assignments from './pages/Assignments';
import ParentDashboard from './pages/ParentDashboard'; 
import Meetings from './pages/Meetings';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/meetings" element={<Meetings />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
