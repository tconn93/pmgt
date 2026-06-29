import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', key: '', description: '' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsAPI.create(formData);
      toast.success('Project created successfully');
      setShowModal(false);
      setFormData({ name: '', key: '', description: '' });
      loadProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Create Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <div className="project-key">{project.key}</div>
              {user?.role === 'ADMIN' && (
                <button
                  className="btn-icon"
                  onClick={() => navigate(`/projects/${project.id}/settings`)}
                  title="Project Settings"
                >
                  ⚙️
                </button>
              )}
            </div>
            <h3>{project.name}</h3>
            <p>{project.description || 'No description'}</p>
            <div className="project-stats">
              <span>{project._count?.issues || 0} issues</span>
              <span>{project.members?.length || 0} members</span>
            </div>
            <div className="project-actions">
              <button
                className="btn-secondary btn-sm"
                onClick={() => navigate(`/projects/${project.id}/board`)}
              >
                Board
              </button>
              <button
                className="btn-secondary btn-sm"
                onClick={() => navigate(`/projects/${project.id}/issues`)}
              >
                Issues
              </button>
              <button
                className="btn-secondary btn-sm"
                onClick={() => navigate(`/projects/${project.id}/sprints`)}
              >
                Sprints
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., My Awesome Project"
                />
              </div>
              <div className="form-group">
                <label htmlFor="key">Project Key</label>
                <input
                  type="text"
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  required
                  placeholder="e.g., MAP"
                  maxLength={10}
                />
                <small>2-10 characters, will be used in issue IDs</small>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
