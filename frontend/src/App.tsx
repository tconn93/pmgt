import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Issues from './pages/Issues';
import Sprints from './pages/Sprints';
import Users from './pages/Users';
import ProjectSettings from './pages/ProjectSettings';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={
  <AdminRoute>
    <Register />
  </AdminRoute>
} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId/board" element={<Board />} />
            <Route path="projects/:projectId/issues" element={<Issues />} />
            <Route path="projects/:projectId/sprints" element={<Sprints />} />
            <Route path="projects/:projectId/settings" element={
              <AdminRoute>
                <ProjectSettings />
              </AdminRoute>
            } />
            <Route path="users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
          </Route>
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
