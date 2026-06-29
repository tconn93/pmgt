import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/projects">JIRA Clone</Link>
        </div>
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/projects" className="navbar-item" onClick={closeMenu}>Projects</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/users" className="navbar-item" onClick={closeMenu}>Users</Link>
          )}
        </div>
        <div className="navbar-end">
          {user && (
            <>
              <span className="navbar-user">{user.name}</span>
              <button className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
